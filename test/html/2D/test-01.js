import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const consoleLog = testBed.subscribe('#f09')

const root = MyNode.vertical({ width:400, height:200, gutter:10, padding:10 }).add(
    // MyNode.new({ width:'fill', height:'fill' }),
    // MyNode.new(),
    MyNode.horizontal({ height:'20%' }),
    MyNode.horizontal({ height:'40%', spacing:10 }).add(
        MyNode.new(),
        MyNode.new(),
        MyNode.new(),
        MyNode.new(),
    ),
    MyNode.horizontal({ height:'20%' }),
)

Object.assign(globalThis, { root })

const { rootNode } = flex.compute2D(root, { verbose:consoleLog })

Object.assign(globalThis, { rootNode })

{
    const display = getDisplay('simple, "fill"')

    for (const node of rootNode.flat()) {

        const strokeColor = node.findUp(n => n.layout.color)?.layout.color ?? display.defaultColor
        display.drawRect(...node.bounds.rect, { strokeColor })
    }
}
