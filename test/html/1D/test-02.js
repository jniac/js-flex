import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'
import draw from './draw.js'

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

const display = getDisplay('"fit"', { color:'#0cf' })
display.addToScope({ root })
display.onStart(() => draw({ flex, root, display }))

testBed.addToPerformanceBench(() => {

    const { averageTime, totalTime, max } = testBed.bench(() => flex.compute(root), 1000)
    const message = `[${averageTime.toFixed(3)}ms] average time for ${max} loop (${root.totalNodeCount} nodes, ${totalTime.toFixed(1)}ms)`

    display.log(message)
    display.addMessageToFooter(message)
})
