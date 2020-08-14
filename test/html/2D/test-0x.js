import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const root = MyNode.horizontal({ width:400, height:200, gutter:10, padding:10 }).add(
    MyNode.horizontal().add(
        MyNode.horizontal().add(
            MyNode.horizontal(),
            MyNode.horizontal(),
            MyNode.vertical().add(
                MyNode.vertical(),
                MyNode.vertical(),
                MyNode.horizontal(),
            ),
        ),
    ),
    MyNode.horizontal(),
    MyNode.vertical().add(
        MyNode.horizontal(),
        MyNode.vertical().add(
            MyNode.vertical(),
            MyNode.vertical(),
            MyNode.vertical(),
        ),
    ),
    MyNode.vertical(),
)

Object.assign(globalThis, { root })

for (const node of root.flat({ includeSelf:false }))
    // node.fill()
    node.setStyle({ width:'100%', height:'20%' })

const { rootNode } = flex.compute2D(root, { verbose:display.log })

Object.assign(globalThis, { rootNode })

{
    const { canvas } = getDisplay('2D')
    const ctx = canvas.getContext('2d')

    const start = { x:50, y:50 }
    const defaultColor = '#0008'

    for (const node of rootNode.flat()) {

        ctx.strokeStyle = node.findUp(n => n.style.color)?.style.color ?? defaultColor

        const x = start.x + node.bounds.x
        const y = start.y + node.bounds.y
        ctx.strokeRect(x, y, node.bounds.width, node.bounds.height)
    }
}
