import flex from '../../src/index.js'

const consoleLog = str => console.log(`%c#00 %c${str}`, 'color:#fc0', '')

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
const root = MyNode.new({ size:600, gutter:10, padding:10 }).add(
    MyNode.new({ color:'#fc0' }).add(
        MyNode.new(),
        MyNode.new().add(
            MyNode.new(),
            MyNode.new(),
        ),
    ),
    MyNode.new(),
    MyNode.new(),
    MyNode.new({ color:'#1e7' }).add(
        MyNode.new(),
        MyNode.new(),
    ),
    MyNode.new(),
)

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

        ctx.textBaseline = 'hanging'
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        const text = `#${node.id}`
        ctx.fillText(text, x + node.bounds.size / 2, y + 5)
    }



    // perf test
    MyNode.debug = false

    let t = -performance.now()
    let max = 1000
    for (let i = 0; i < max; i++)
        flex.compute(root)
    t += performance.now()
    t /= max

    const message = `[${t.toFixed(3)}ms] average time for ${max} loop (${root.totalNodeCount} nodes)`
    ctx.textBaseline = 'hanging'
    ctx.textAlign = 'left'
    ctx.font = '14px monospace'
    ctx.fillStyle = defaultColor
    ctx.fillText(message, 10, 10)

    consoleLog(message)
}
