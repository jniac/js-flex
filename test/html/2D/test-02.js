import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const consoleLog = testBed.subscribe('#f09')

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
            MyNode.vertical({ width:'fill', height:'fill' }),
        ),
    ),
)

console.log(root.toGraphString(n => `${n.toString()} ${n.layout.direction}`))

Object.assign(globalThis, { root })

const { canvas, scope } = getDisplay('alignSelf|items')
const ctx = canvas.getContext('2d')

scope.blue = root.query(c => c.layout.color === 'blue')[0]

const draw = () => {

    const { rootNode } = flex.compute2D(root, { verbose:consoleLog })
    Object.assign(scope, { rootNode })
    console.log(rootNode.toGraphString(n => `${n.toString()} ${n.layout.direction}`))


    const start = { x:50, y:50 }
    const defaultColor = '#0008'

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const node of rootNode.flat()) {

        ctx.strokeStyle = node.findUp(n => n.layout.color)?.layout.color ?? defaultColor

        const x = start.x + node.bounds.x
        const y = start.y + node.bounds.y
        ctx.strokeRect(x, y, node.bounds.width, node.bounds.height)
    }
}


let frame = 0, time = 0
const loop = () => {

    {
        // alignItems animation
        root.layout.alignItems = `${((Math.sin(time * .2) * .5 + .5) * 100).toFixed(1)}%`

        const [node] = root.query(n => n.layout.color === 'red')
        node.layout.alignSelf = `${((Math.cos(time * .8) * .5 + .5) * 100).toFixed(1)}%`
    }

    // requestAnimationFrame(loop)

    draw()

    time += 1 / 60
    frame++
}

loop()
