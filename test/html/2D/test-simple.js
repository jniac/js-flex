import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const consoleLog = testBed.subscribe('#f09')

const root = MyNode.vertical({ width:500, height:200, spacing:10 }).add(
    MyNode.new({ color:'#096', width:'fill', height:'fill' }), // "fill" is the default value for "width" & "height"
    MyNode.new({ color:'#096' }),
    MyNode.horizontal({ height:'50%', spacing:10 }).add(
        MyNode.new(),
        MyNode.new(),
        MyNode.new(),
        MyNode.vertical({ width:34, spacing:10 }).add(
            MyNode.new(),
            MyNode.new(),
        ),
    ),
    MyNode.horizontal({ height:'20%' }),
)

Object.assign(globalThis, { root })

const display = getDisplay('simple, "fill"')

const { rootNode } = flex.compute2D(root, { verbose:consoleLog })
Object.assign(display.scope, { rootNode })

// draw
for (const node of rootNode.flat()) {

    const strokeColor = node.findUp(n => n.layout.color)?.layout.color ?? display.defaultColor
    display.drawRect(...node.bounds.rect, { strokeColor })
}
