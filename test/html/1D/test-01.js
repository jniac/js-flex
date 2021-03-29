import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import MyNode from './MyNode.js'
import getDisplay from '../getDisplay.js'
import draw from './draw.js'

const root = MyNode.new({ size:500, gutter:10, padding:10 }).add(
    MyNode.new({ color:'#fc0' }).add(
        MyNode.new(),
        MyNode.new().add(
            MyNode.new(),
            MyNode.new(),
        ),
    ),
    MyNode.new(),
    MyNode.new(),
    MyNode.new({ color:'#1e7' }).add(
        MyNode.new(),
        MyNode.new(),
    ),
    MyNode.new(),
)

const display = getDisplay('basic', { color:undefined })
display.addToScope({ root })
display.onStart(() => draw({ flex, root, display }))


testBed.addToPerformanceBench(() => {

    const { averageTime, totalTime, max } = testBed.bench(() => flex.compute(root), 1000)
    const message = `[${averageTime.toFixed(3)}ms] average time for ${root.totalNodeCount} nodes (${max} loop, ${totalTime.toFixed(1)}ms)`

    display.log(message)
    display.addMessageToFooter(message)
})
