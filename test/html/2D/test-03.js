import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const consoleLog = testBed.subscribe('#f09')

const root = MyNode.vertical({ width:500, height:200, gutter:10, padding:10, alignItems:'0%' }).add(
    MyNode.horizontal({ width:'fit', height:'1w', gutter:10, padding:10 }).add(
        MyNode.new({ width:80, order:0 }),
        MyNode.new({ width:80, order:10 }),
        MyNode.new({ width:160, order:11, color:'blue' }),
    ),
    MyNode.horizontal({ width:'fit', height:'1w', gutter:10, padding:10, alignSelf:'50%' }).add(
        MyNode.new({ width:80, order:0 }),
        MyNode.new({ width:80, order:10 }),
        MyNode.new({ width:160, order:1, color:'blue' }),
    ),
    MyNode.horizontal({ width:'fit', height:'1w', gutter:10, padding:10, alignSelf:'25%' }).add(
        MyNode.new({ width:80, order:0 }),
        MyNode.new({ width:80, order:10 }),
        MyNode.new({ width:160, order:-1, color:'blue' }),
    ),
)

console.log(root.toGraphString(n => `${n.toString()} ${n.layout.direction ?? '(horizontal)'}`))

Object.assign(globalThis, { root })

const { canvas, scope } = getDisplay('order, "fit"')
const ctx = canvas.getContext('2d')

const draw = () => {

    const { rootNode } = flex.compute2D(root)
    Object.assign(scope, { rootNode })
    // console.log(rootNode.toGraphString(n => `${n.toString()} ${n.layout.direction}`))


    const start = { x:50, y:50 }
    const defaultColor = '#0008'

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const node of rootNode.flat()) {

        ctx.strokeStyle = node.findUp(n => n.layout.color)?.layout.color ?? defaultColor

        const x = start.x + node.bounds.x
        const y = start.y + node.bounds.y
        ctx.strokeRect(x, y, node.bounds.width, node.bounds.height)
    }
}


let frame = 0, time = 0
const loop = () => {

    // requestAnimationFrame(loop)

    draw()

    time += 1 / 60
    frame++
}

loop()
