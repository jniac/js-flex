import flex from '../../src/index.js'

class MyNode extends flex.Node {

    static debug = true

    constructor(layout) {

        super()

        this.layout = layout
    }

    get bounds() { return this._bounds }
    set bounds(value) {
        this._bounds = value

        if (MyNode.debug)
            console.log(`i'm receiving my bounds!`)
    }
}

const someChildren = (n, props) => new Array(n).fill(null).map(() => new MyNode(props))

const root =
new MyNode({
    size: 'fit',
    padding: 40,
})
.add(
    // size: immediatly ready
    // pos: computed by parent
    new MyNode({
        size: 100,
    }),

    // size: immediatly ready
    // pos: computed by parent
    new MyNode({
        size: 200,
        color: '#f00',
    })
    .add(
        new MyNode({ size:'33.333%', color: '#f00' }),
        new MyNode({ size:'1w', color: '#f009' }),
        new MyNode({ size:'2w', color: '#f009' }),
    ),

    // size: wait for parent 'size' computing
    // pos: computed by parent
    new MyNode({
        position: 'absolute',
        size: '100%',
        color: '#09f',
    }),

    // size: wait for parent 'size' computing
    // pos: computed by parent
    new MyNode({
        position: 'absolute',
        size: '50%',
        offset: '50%',
        align: 'center',
    })
    .add(
        new MyNode({ size:'1w' }),
        new MyNode({ size:'1w' }),
    ),

    // size: wait for parent 'size' computing
    // pos: computed by parent
    new MyNode({
        position: 'absolute',
        size: '100%',
        color:'#6c9',
    })
    // .add(...someChildren(3, { color:'#6c9', size:50 })),
    .add(...someChildren(3, { color:'#6c9', size:"40%" })),
)

const { rootNode } = flex.compute(root, { verbose:true })

Object.assign(globalThis, { rootNode })



{
    // draw

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 300
    document.body.append(canvas)

    const ctx = canvas.getContext('2d')
    const start = { x:50, y:10 }

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
    let max = 10000
    for (let i = 0; i < max; i++)
        flex.compute(root)
    t += performance.now()
    t /= max

    console.log(`[${t.toFixed(3)}ms] average time for ${max} loop`)
}