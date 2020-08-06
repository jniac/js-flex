import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const consoleLog = testBed.subscribe('#f09')

const root = MyNode.vertical({ width:500, height:200, gutter:10, padding:10, alignItems:'0%' }).add(
    // normal
    MyNode.horizontal({ gutter:10, padding:10 }).add(
        MyNode.new({ width:80 }),
        MyNode.new({ width:80 }),
        MyNode.new({ width:160, color:'blue' }),
    ),
    // in the middle
    MyNode.horizontal({ gutter:10, padding:10, alignSelf:'50%' }).add(
        MyNode.new({ width:80 }),
        MyNode.new({ width:80, order:20 }),
        MyNode.new({ width:160, order:10, color:'blue' }),
    ),
    // i'm fiiiirst!
    MyNode.horizontal({ gutter:10, padding:10, alignSelf:'25%' }).add(
        MyNode.new({ width:80 }),
        MyNode.new({ width:80 }),
        MyNode.new({ width:160, order:-1, color:'blue' }),
    ),
)

console.log(root.toGraphString(n => `${n.toString()} ${n.layout.direction ?? '(horizontal)'}`))

Object.assign(globalThis, { root })

const display = getDisplay('order')

const draw = () => {

    const { rootNode } = flex.compute2D(root)
    Object.assign(display.scope, { rootNode })
    // console.log(rootNode.toGraphString(n => `${n.toString()} ${n.layout.direction}`))


    for (const node of rootNode.flat()) {

        const strokeColor = node.findUp(n => n.layout.color)?.layout.color ?? display.defaultColor
        display.drawRect(...node.bounds.rect, { strokeColor })
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
