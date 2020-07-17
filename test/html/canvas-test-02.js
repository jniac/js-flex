import flex from '../../src/index.js'

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

    get bounds() { return this._bounds }
    set bounds(value) {
        this._bounds = value
    }
}

const tree = new MyNode({ padding:0, size:400, gutter:0, justify:'space-between' })
.add(
    ...MyNode.repeat(1, { size:60 }),
    MyNode.new({ size:60 }).add(
        MyNode.new({ size:10 }).add(
            MyNode.new({ size:10 }).add(
                MyNode.new({ size:10 }).add(
                    MyNode.new({ position:'absolute', size:200, gutter:4, padding:4 / 2, align:'center' }).add(
                        ...MyNode.repeat(5, { size:'1w' }),
                        MyNode.new({ position:'absolute', size:200, gutter:4 }).add(
                            ...MyNode.repeat(13, i => ({ size:i % 2 ? '3w' : '1w' })),
                        ),
                    ),
                ),
            ),
        ),
    ),
    ...MyNode.repeat(3, { size:60 }),
    MyNode.new({ color:'red', size:60 }).add(
        MyNode.new({ color:'red', position:'absolute', size:'50%', offset:'center', align:'center' }).add(
            MyNode.new({ color:'red', position:'absolute', size:'50%', offset:'center', align:'center' }).add(
                MyNode.new({ name:'red-grand-child', color:'red', size:200, padding:0 }).add(
                    ...MyNode.repeat(9, { color:'red', size:'1w' }),
                )
            ),
        ),
    ),
    MyNode.new({ color:'#f90', size:60 }).add(
        MyNode.new({ name:'the-yellow-one', color:'#f90', position:'absolute', size:'20%', align:'center' }),
        MyNode.new({ name:'the-yellow-two', color:'#f90', position:'absolute', size:'50%', offsetAlign:'100%' }),
    ),
)

const width = 600
const height = 300

const canvas = document.createElement('canvas')
canvas.width = width
canvas.height = height
document.body.append(canvas)

const ctx = canvas.getContext('2d')
const start = { x:50, y:50 }

let frame = 0, time = 0
const draw = () => {

    const { rootNode } = flex.compute(tree, { verbose:frame === 0 })

    const ranges = new Set()
    const collidesWithAnExistingRange = (node, dy) => {

        for (const range of ranges)
            if (range.dy === dy && range.node.bounds.intersects(node.bounds))
                return true

        return false
    }

    ctx.clearRect(0, 0, width, height)

    for (const node of rootNode.flat()) {

        ctx.fillStyle = node.layout.color ?? '#0008'

        let dy = node.depth * 12
        while (collidesWithAnExistingRange(node, dy))
            dy += 3

        ranges.add({ node, dy })

        const x = start.x + node.bounds.position
        const y = start.y + dy
        ctx.fillRect(x, y, node.bounds.size, 2)
    }
}

const loop = () => {

    {
        const [node] = tree.query(n => n.layout.name === 'the-yellow-one')
        node.layout.offset = `${((Math.sin(time * 2) * .5 + .5) * 100).toFixed(1)}%`
    }

    {
        const [node] = tree.query(n => n.layout.name === 'the-yellow-two')
        node.layout.offsetAlign = `${((Math.sin(time * 4) * .5 + .5) * 100).toFixed(1)}%`
    }

    {
        const [node] = tree.query(n => n.layout.name === 'red-grand-child')
        const value = (Math.sin(time * 4) * .5) * 30
        node.layout.padding = value / 2
        node.layout.gutter = value
    }

    {
        tree.layout.size = 300 + Math.round((Math.sin(time * .4) * .5 + .5) * 100)
    }

    requestAnimationFrame(loop)

    draw()

    time += 1 / 60
    frame++
}

loop()
