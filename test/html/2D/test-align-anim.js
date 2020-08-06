import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const root = MyNode.vertical({ width:500, height:200, gutter:4, padding:10, alignItems:'0%' }).add(
    MyNode.vertical({ width:'40%', height:'1w' }),
    MyNode.vertical({ width:'50%', height:'1w' }),
    MyNode.vertical({ width:'60%', height:'1w' }),
    MyNode.horizontal({ width:'70%', height:'3w', color:'red', alignSelf:'100%', gutter:4, padding:10 }).add(
        MyNode.vertical({ width:'1w', height:'100%' }),
        MyNode.vertical({ width:'1w', height:'100%' }),
        MyNode.horizontal({ width:'2w', height:'100%', color:'blue', order:-1, gutter:4, padding:10 }).add(
            MyNode.vertical({ width:'fill', height:'fill' }),
            MyNode.vertical({ width:'fill', height:'fill' }),
            MyNode.vertical({ width:'fill', height:'fill', color:'transparent', gutter:4 }).add(
                MyNode.new({ color:'blue' }),
                MyNode.new({ color:'blue' }),
                MyNode.new({ color:'blue' }),
                MyNode.new({ color:'blue' }),
            ),
        ),
    ),
)

console.log(root.toGraphString(n => `${n.toString()} ${n.layout.direction ?? '(horizontal)'}`))

Object.assign(globalThis, { root })

const display = getDisplay('alignItems|Self', { color:'red' })

display.scope.blue = root.query(c => c.layout.color === 'blue')[0]

const draw = () => {

    const { rootNode } = flex.compute2D(root)
    Object.assign(display.scope, { rootNode })
    // console.log(rootNode.toGraphString(n => `${n.toString()} ${n.layout.direction}`))

    display.clear()

    for (const node of rootNode.flat()) {

        const strokeColor = node.findUp(n => n.layout.color)?.layout.color ?? display.defaultColor
        const { x, y, width, height } = node.bounds
        display.drawRect(x, y, width, height, { strokeColor })
    }
}


const loop = () => {

    {
        // alignItems animation
        root.layout.alignItems = `${((Math.sin(time * .2) * .5 + .5) * 100).toFixed(1)}%`

        const [node] = root.query(n => n.layout.color === 'red')
        node.layout.alignSelf = `${((Math.cos(time * .8) * .5 + .5) * 100).toFixed(1)}%`
    }

    {
        // blue animation for fun
        const [node] = root.query(n => n.layout.color === 'blue')
        node.layout.width = `${((-Math.cos(time * .8 * 4) * .5 + .5) * 2 + 2).toFixed(3)}w`

    }

    requestAnimationFrame(loop)

    draw()

    time += 1 / 60
    frame++
}

const update = ({ frame, time }) => {

    {
        // alignItems animation
        root.layout.alignItems = `${((-Math.cos(time * .2) * .5 + .5) * 100).toFixed(1)}%`

        const [node] = root.query(n => n.layout.color === 'red')
        node.layout.alignSelf = `${((Math.cos(time * .8) * .5 + .5) * 100).toFixed(1)}%`
    }

    {
        // blue animation for fun
        const [node] = root.query(n => n.layout.color === 'blue')
        node.layout.width = `${((-Math.cos(time * .8 * 4) * .5 + .5) * 2 + 2).toFixed(3)}w`

    }

    draw()
}

display.onStart(draw)
display.onUpdate(update)

testBed.addToPerformanceBench(() => {

    const { averageTime, totalTime, max } = testBed.bench(() => flex.compute2D(root), 1000)

    const message = `[${averageTime.toFixed(3)}ms] average time for ${max} loop (${root.totalNodeCount} nodes, ${totalTime.toFixed(1)}ms)`

    display.log(message)
})
