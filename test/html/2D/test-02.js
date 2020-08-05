import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const consoleLog = testBed.subscribe('#f09')

const root = MyNode.vertical({ width:500, height:200, gutter:4, padding:10 }).add(
    MyNode.vertical({ width:'40%', height:'2w' }),
    MyNode.vertical({ width:'40%', height:'1w' }),
    MyNode.vertical({ width:'40%', height:'1w' }),
)

Object.assign(globalThis, { root })

const { rootNode } = flex.compute2D(root, { verbose:consoleLog })

Object.assign(globalThis, { rootNode })

{
    const { canvas } = getDisplay('2D')
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
