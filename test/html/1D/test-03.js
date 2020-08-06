import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'
import draw from './draw.js'

const root = new MyNode({ padding:0, size:400, gutter:0, justify:'space-between' }).add(
    ...MyNode.repeat(1, { size:60 }),
    MyNode.new({ size:60 }).add(
        MyNode.new({ size:10 }).add(
            MyNode.new({ size:10 }).add(
                MyNode.new({ size:10 }).add(
                    MyNode.new({ position:'absolute', size:200, gutter:4, padding:4 / 2, absoluteAlign:'center' }).add(
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
        MyNode.new({ color:'red', position:'absolute', size:'50%', absoluteOffset:'center', absoluteAlign:'center' }).add(
            MyNode.new({ color:'red', position:'absolute', size:'50%', absoluteOffset:'center', absoluteAlign:'center' }).add(
                MyNode.new({ name:'red-grand-child', color:'red', size:200, padding:0 }).add(
                    ...MyNode.repeat(9, { color:'red', size:'1w' }),
                )
            ),
        ),
    ),
    MyNode.new({ color:'#f90', size:60 }).add(
        MyNode.new({ name:'the-yellow-one', color:'#f90', position:'absolute', size:'20%', absoluteAlign:'center' }),
        MyNode.new({ name:'the-yellow-two', color:'#f90', position:'absolute', size:'50%', absoluteOffsetAlign:'100%' }),
    ),
)


const display = getDisplay('"fit"', { color:undefined })
display.addToScope({ root })
display.onStart(() => draw({ flex, root, display, showText:false, depthStride:20 }))

const update = ({ time }) => {

    {
        const node = root.find(n => n.layout.name === 'the-yellow-one')
        node.layout.absoluteOffset = `${((Math.sin(time * 2) * .5 + .5) * 100).toFixed(1)}%`
    }

    {
        const node = root.find(n => n.layout.name === 'the-yellow-two')
        node.layout.absoluteOffsetAlign = `${((Math.sin(time * 4) * .5 + .5) * 100).toFixed(1)}%`
    }

    {
        const node = root.find(n => n.layout.name === 'red-grand-child')
        const value = (Math.sin(time * 4) * .5) * 30
        node.layout.padding = value / 2
        node.layout.gutter = value
    }

    {
        root.layout.size = 300 + Math.round((Math.sin(time * .4) * .5 + .5) * 100)
    }

    draw({ flex, root, display, showText:false, depthStride:20 })
}
display.onUpdate(update)

testBed.addToPerformanceBench(() => {

    const { averageTime, totalTime, max } = testBed.bench(() => flex.compute(root), 1000)
    const message = `[${averageTime.toFixed(3)}ms] average time for ${max} loop (${root.totalNodeCount} nodes, ${totalTime.toFixed(1)}ms)`

    display.log(message)
    display.addMessageToFooter(message)
})
