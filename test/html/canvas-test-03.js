import flex from '../../src/index.js'

const consoleLog = str => console.log(`%c#03 %c${str}`, 'color:#fc0', '')

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

const { rootNode } = flex.compute(root, { verbose:consoleLog })

Object.assign(globalThis, { rootNode })



{
    // draw

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 300
    document.body.append(canvas)

    const ctx = canvas.getContext('2d')
    const start = { x:0, y:10 }

    const ranges = new Set()
    const collidesWithAnExistingRange = (node, dy) => {

        for (const range of ranges)
            if (range.dy === dy && range.node.bounds.intersects(node.bounds))
                return true

        return false
    }

    for (const node of rootNode.flat()) {

        ctx.fillStyle = node.layout.color ?? '#0008'

        let dy = node.depth * 50
        while (collidesWithAnExistingRange(node, dy))
            dy += 3

        ranges.add({ node, dy })

        const x = start.x + node.bounds.position
        const y = start.y + dy
        ctx.fillRect(x, y, node.bounds.size, 2)
    }
}

{
    // perf test
    MyNode.debug = false

    let t = -performance.now()
    let max = 1000
    for (let i = 0; i < max; i++)
        flex.compute(root)
    t += performance.now()
    t /= max

    consoleLog(`[${t.toFixed(3)}ms] average time for ${max} loop (${root.totalNodeCount} nodes)`)
}
