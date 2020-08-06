import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const consoleLog = testBed.subscribe('#f09')

const root = MyNode.new({ width:500, height:200, spacing:10 })
    .add(MyNode.horizontal({ width:'fit', height:'fit', spacing:10 }).add(
        MyNode.horizontal({ height:50, width:50 }),
        MyNode.horizontal({ height:'fit', width:'fit', spacing:10 }).add(
            MyNode.vertical({ sides:'fit', spacing:10 }).add(
                MyNode.new({ sides:50 }),
                MyNode.new({ sides:50 }),
            ),
            MyNode.horizontal({ sides:50 }),
            // this will break until 'relative' sized children are ignored from fit
            // MyNode.horizontal({ height:'fill', width:50 }),
            MyNode.vertical({ sides:'fit', spacing:10 }).add(
                MyNode.new({ width:10, height:10 }),
                MyNode.horizontal({ sides:50, color:'red', spacing:2 }).add(
                    MyNode.new(),
                    MyNode.new(),
                    MyNode.new(),
                ),
                MyNode.new({ width:10, height:10 }),
            ),
            MyNode.horizontal({ sides:50 }),
        ),
        MyNode.horizontal({ sides:50 }),
    ),
)

Object.assign(globalThis, { root })

const display = getDisplay('"fit"')

const draw = () => {

    const { rootNode } = flex.compute2D(root)
    Object.assign(display.scope, { rootNode })

    display.clear()

    for (const node of rootNode.flat()) {

        const strokeColor = node.findUp(n => n.layout.color)?.layout.color ?? display.defaultColor
        display.drawRect(...node.bounds.rect, { strokeColor })
    }
}

const update = ({ time }) => {

    const [node] = root.query(n => n.layout.color === 'red')
    node.layout.sides = 50 + 30 * Math.sin(time)

    draw()
}

display.onStart(draw)
// display.onUpdate(update)
