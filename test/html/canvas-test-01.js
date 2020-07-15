import flex from '../../src/index.js'

const consoleLog = str => console.log(`%c#01 %c${str}`, 'color:#c0f', '')

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

// mix of 'fit' mode
const root = MyNode.new({ size:'fit', gutter:10, padding:10 }).add(
    MyNode.new({ size:'fit', gutter:10, color:'#fc0' }).add(
        MyNode.new({ size:30 }),
        MyNode.new({ size:30 }).add(
        ),
    ),
    MyNode.new({ size:30 }),
    MyNode.new({ size:30 }),

    MyNode.new({ size:120, gutter:10, color:'#1e7' }).add(
        MyNode.new({ size:20 }),
        MyNode.new({ size:20 }),
        MyNode.new({ size:'1w' }),
    ),
    MyNode.new({ size:30 }),
    MyNode.new({ size:120, gutter:10, color:'#39f' }).add(
        MyNode.new({ size:20 }),
        MyNode.new({ size:20 }),
        MyNode.new({ size:'fit' }).add(
            MyNode.new({ size:20 }),
            MyNode.new({ size:20 }),
        ),
    ),
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
    const start = { x:10, y:50 }
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
