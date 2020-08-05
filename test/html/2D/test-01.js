import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const consoleLog = testBed.subscribe('#f09')

const root = MyNode.vertical({ width:400, height:200, gutter:10, padding:10 }).add(
    MyNode.horizontal({ width:'100%', height:'20%' }),
    MyNode.horizontal({ width:'100%', height:'40%' }),
    MyNode.horizontal({ width:'100%', height:'20%' }),
)

Object.assign(globalThis, { root })

const { rootNode } = flex.compute2D(root, { verbose:consoleLog })

Object.assign(globalThis, { rootNode })

{
    const { canvas } = getDisplay('simple')
    const ctx = canvas.getContext('2d')

    const start = { x:50, y:50 }
    const defaultColor = '#0008'

    for (const node of rootNode.flat()) {

        ctx.strokeStyle = node.findUp(n => n.layout.color)?.layout.color ?? defaultColor

        const x = start.x + node.bounds.x
        const y = start.y + node.bounds.y
        ctx.strokeRect(x, y, node.bounds.width, node.bounds.height)
    }
}
