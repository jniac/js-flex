import flex from '../../src/index.js'
import testBed from './testBed.js'

const consoleLog = testBed.subscribe('#f06')

class MyNode extends flex.Node {

    static repeat(n, layout) {

        if (typeof layout === 'function')
            return new Array(n).fill().map((v, index) => new MyNode(layout(index)))

        return new Array(n).fill().map(() => new MyNode(layout))
    }

    static new(layout) { return new MyNode(layout) }

    constructor(layout) {

        super()

        this.layout = layout
    }
}

const nextItem = (...items) => {

    let index = -1
    const nextIndex = () => index = (index + 1) % items.length

    return () => items[nextIndex()]
}

const next = {
    childrenCount: nextItem(3, 7, 4, 3, 6, 3, 11),
    size: nextItem('1w', '3w', '10%', '1w', '3w', '1w', '50%'),
}

const addSomeChildren = (parent, recursiveLimit = 3) => {

    if (recursiveLimit > 0) {

        const count = next.childrenCount()
        for (let i = 0; i < count; i++) {

            const child = MyNode.new({ size:next.size() })
            addSomeChildren(child, recursiveLimit - 1)
            parent.add(child)
        }
    }
}

const root = MyNode.new({ size:600, gutter:10, padding:10 })

addSomeChildren(root, 4)

root.children[1].layout.color = '#36f'

for (const [index, child] of root.children[1].children.entries()) {
    if (index % 2)
        child.layout.color = '#3f9'
}



const { rootNode } = flex.compute(root, { verbose:consoleLog })

Object.assign(globalThis, { rootNode })



{
    // draw

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 300
    document.body.append(canvas)

    const ctx = canvas.getContext('2d')
    const start = { x:0, y:50 }
    const defaultColor = '#0008'

    const ranges = new Set()
    const collidesWithAnExistingRange = (node, dy) => {

        for (const range of ranges)
            if (range.dy === dy && range.node.bounds.intersects(node.bounds))
                return true

        return false
    }

    for (const node of rootNode.flat()) {

        ctx.fillStyle = node.findUp(n => n.layout.color)?.layout.color ?? defaultColor

        let dy = node.depth * 50
        while (collidesWithAnExistingRange(node, dy))
            dy += 3

        ranges.add({ node, dy })

        const x = start.x + node.bounds.position
        const y = start.y + dy
        ctx.fillRect(x, y, node.bounds.size, 2)
    }



    // perf test
    testBed.addToPerformanceBench(() => {

        MyNode.debug = false

        const { averageTime, totalTime, max } = testBed.bench(() => flex.compute(root), 1000)

        const message = `[${averageTime.toFixed(3)}ms] average time for ${max} loop (${root.totalNodeCount} nodes, ${totalTime.toFixed(1)}ms)`

        ctx.textBaseline = 'hanging'
        ctx.textAlign = 'left'
        ctx.font = '14px monospace'
        ctx.fillStyle = defaultColor
        ctx.fillText(message, 10, 10)

        consoleLog(message)
    })
}
