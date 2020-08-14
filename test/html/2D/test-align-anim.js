import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const root = MyNode.vertical({ width:500, height:200, gutter:4, padding:10, alignItems:'0%', stroke:'#93f' }).add(
    MyNode.vertical({ width:'40%', height:'1w' }),
    MyNode.vertical({ width:'50%', height:'1w' }),
    MyNode.vertical({ width:'60%', height:'1w' }),
    MyNode.horizontal({ width:'70%', height:'3w', stroke:'#93f', color:'blue', alignSelf:'100%', gutter:4, padding:10 }).add(
        MyNode.vertical({ width:'1w', height:'100%' }),
        MyNode.vertical({ width:'1w', height:'100%' }),
        MyNode.horizontal({ width:'2w', height:'100%', stroke:'#93f', order:-1, gutter:4, padding:10 }).add(
            MyNode.vertical({ width:'fill', height:'fill' }),
            MyNode.vertical({ width:'fill', height:'fill' }),
            MyNode.vertical({ width:'fill', height:'fill', stroke:false, gutter:4 }).add(
                MyNode.new(),
                MyNode.new(),
                MyNode.new(),
                MyNode.new(),
            ),
        ),
    ),
)

console.log(root.toGraphString(n => `${n.toString()} ${n.style.direction ?? '(horizontal)'}`))

Object.assign(globalThis, { root })

const display = getDisplay('alignItems|Self', { color:'#93f' })

display.scope.blue = root.query(c => c.style.color === 'blue')[0]

const draw = () => {

    const { rootNode } = flex.compute2D(root)
    display.addToScope({ rootNode })
    // console.log(rootNode.toGraphString(n => `${n.toString()} ${n.style.direction}`))

    display.clear()

    for (const node of rootNode.flat()) {

        const orColor = (value, defaultValue) => value && (typeof value === 'string' ? value : defaultValue)

        const color = node.findUp(n => n.style.color !== undefined)?.style.color ?? display.defaultColor
        const stroke = node.style.stroke ?? true
        const fill = node.style.fill ?? false
        const strokeColor = orColor(stroke, color)
        const fillColor = orColor(fill, color)

        display.drawRect(...node.bounds.rect, { strokeColor, fillColor })
    }
}

const update = ({ frame, time }) => {

    {
        // alignItems animation
        root.style.alignItems = `${((-Math.cos(time * .2) * .5 + .5) * 100).toFixed(1)}%`

        const node = root.children[3]
        node.style.alignSelf = `${((Math.cos(time * .8) * .5 + .5) * 100).toFixed(1)}%`
    }

    {
        // blue animation for fun
        const node = root.children[3].children[2]
        node.style.width = `${((-Math.cos(time * .8 * 4) * .5 + .5) * 2 + 2).toFixed(3)}w`
    }

    draw()
}

display.onStart(draw)
display.onUpdate(update)

testBed.addToPerformanceBench(() => {

    const { averageTime, totalTime, max } = testBed.bench(() => flex.compute2D(root), 1000)

    const message = `[${averageTime.toFixed(3)}ms] average time for ${max} loop (${root.totalNodeCount} nodes, ${totalTime.toFixed(1)}ms)`

    display.log(message)
    display.addMessageToFooter(message)
})
