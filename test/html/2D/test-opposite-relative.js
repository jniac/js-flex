import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const root = MyNode.horizontal({ width:500, height:200, stroke:true }).add(
    MyNode.horizontal({ width:500, height:200, spacing:10, stroke:'#93f' }).add(
        MyNode.horizontal({ width:'1w', stroke:true }),
        MyNode.vertical({ width:'1op', spacing:10, stroke:false, fill:'#fc0', color:'#963' }).add(
            MyNode.horizontal({ justify:'space-between' }).add(
                MyNode.new({ name:'small', width:'1op', fill:true }),
                MyNode.new({ name:'small', width:'1op', fill:true }),
            ),
            MyNode.horizontal({ justify:'space-between' }).add(
                MyNode.new({ name:'small', width:'1op', fill:true }),
                MyNode.new({ name:'small', width:'1op', fill:true }),
            ),
        ),
        MyNode.horizontal({ width:'10%' }),
        MyNode.horizontal({ width:'3w', stroke:true, spacing:10 }).add(
            MyNode.new({ sides:'.1w' }),
            MyNode.new({ name:'16/9', height:`${9 / 16}op`, fill:'#03c', stroke:false }),
            MyNode.new({ sides:'.1w' }),
        ),
    ),
)

Object.assign(globalThis, { root })

const display = getDisplay('opposite-relative "1op", ${16/9}op')

const { rootNode } = flex.compute2D(root, { verbose:display.log })
display.addToScope({ rootNode })

display.addMessageToFooter(`the yellow box is a square (size: ${rootNode.find(n => n.layout.width === '1op').bounds.size2D.join(',')})`)
display.addMessageToFooter(`the brown boxes too (size: ${rootNode.find(n => n.layout.name === 'small').bounds.size2D.join(',')})`)
display.addMessageToFooter(`the blue box is 16/9 (size: ${rootNode.find(n => n.layout.name === '16/9').bounds.size2D.join(',')})`)

const draw = () => {

    const { rootNode } = flex.compute2D(root)

    display.clear()

    for (const node of rootNode.flat()) {

        const orColor = (value, defaultValue) => value && (typeof value === 'string' ? value : defaultValue)

        const color = node.findUp(n => n.layout.color !== undefined)?.layout.color ?? display.defaultColor
        const stroke = node.layout.stroke ?? true
        const fill = node.layout.fill ?? false
        const strokeColor = orColor(stroke, color)
        const fillColor = orColor(fill, color)

        display.drawRect(...node.bounds.rect, { strokeColor, fillColor })
    }
}

draw()

const update = ({ time, timeCos01 }) => {

    const sub = 100 * (1 - timeCos01)
    const node = root.children[0]
    node.layout.width = 500 - 20 - sub
    node.layout.height = 200 - 20 - sub

    draw()
}

display.onUpdate(update)
