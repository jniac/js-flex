import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const root = MyNode.new({ width:500, height:200, spacing:10 })
    .add(MyNode.horizontal({ width:'fit', height:'fit', spacing:10 }).add(
        MyNode.horizontal({ height:50, width:50 }),
        MyNode.horizontal({ height:'fit', width:'fit', padding:10, gutter:3 }).add(
            MyNode.vertical({ sides:'fit', spacing:10 }).add(
                MyNode.new({ width:50, height:10 }),
                MyNode.new({ width:50, height:10 }),
            ),
            MyNode.horizontal({ height:'fill', width:10, color:'#0cc' }),
            MyNode.horizontal({ height:'80%', width:10, color:'#0cc' }),
            MyNode.horizontal({ height:'60%', width:10, color:'#0cc' }),
            MyNode.vertical({ sides:'fit', padding:10, gutter:3 }).add(
                MyNode.new({ height:10, color:'#0cc' }),
                MyNode.horizontal({ sides:50, color:'#93f', spacing:3 }).add(
                    MyNode.new(),
                    MyNode.new(),
                    MyNode.new(),
                ),
                MyNode.new({ height:10, color:'#0cc' }),
            ),
            MyNode.horizontal({ sides:10 }),
            MyNode.vertical({ height:'fill', width:'fit', color:'#0cc', spacing:3 }).add(
                MyNode.new({ width:10 }),
                MyNode.new({ width:10 }),
                MyNode.new({ width:10 }),
            ),
            MyNode.horizontal({ height:'fill', width:'fit', color:'#0cc', spacing:3 }).add(
                MyNode.new({ width:10 }),
                MyNode.new({ width:10 }),
                MyNode.new({ width:10 }),
            ),
        ),
        MyNode.horizontal({ sides:50 }),
        MyNode.new({ color:'red'}),
    ),
)

const display = getDisplay('"fit"', { color:'#0cc' })
display.addToScope({ root })

const draw = (verbose = true) => {

    const { rootNode } = flex.compute2D(root, { verbose:verbose && display.log })
    display.addToScope({ rootNode })

    display.clear()

    for (const node of rootNode.flat()) {

        const strokeColor = node.findUp(n => n.style.color)?.style.color ?? display.defaultColor
        display.drawRect(...node.bounds.rect, { strokeColor })
    }
}

const update = ({ time }) => {

    const [node] = root.query(n => n.style.color === '#93f')
    node.style.sides = 50 + 30 * Math.sin(time * 2)

    draw(false)
}

display.onStart(draw)
display.onUpdate(update)

testBed.addToPerformanceBench(() => {

    const { averageTime, totalTime, max } = testBed.bench(() => flex.compute2D(root), 1000)

    const message = `[${averageTime.toFixed(3)}ms] average time for ${root.totalNodeCount} nodes (${max} loop, ${totalTime.toFixed(1)}ms)`

    display.log(message)
    display.addMessageToFooter(message)
})
