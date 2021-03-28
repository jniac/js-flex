import flex from '../../../src/index.js'
import MyNode from '../1D/MyNode.js'

const root = MyNode.new({ size:500, gutter:10, padding:10 }).add(
    MyNode.new({ name:'foo' }).add(
        MyNode.new(),
        MyNode.new().add(
            MyNode.new(),
            MyNode.new(),
        ),
    ),
    MyNode.new(),
    MyNode.new(),
    MyNode.new({ name:'bar', size:'2w' }).add(
        MyNode.new(),
        MyNode.new(),
    ),
    MyNode.new(),
)

const pre = document.querySelector('pre')

let time = 0
const loop = () => {

    time += 1 / 60

    const node = root.find(n => n.style?.name === 'bar')
    node.style.size = `${(4 + 3 * Math.sin(time * 3)).toFixed(2)}w`
    
    pre.innerHTML = flex.treeToString(root)

    requestAnimationFrame(loop)
}

loop()