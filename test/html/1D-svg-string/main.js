import flex from '../../../src/index.js'
import MyNode from '../1D/MyNode.js'

const root = MyNode.new({ size:500, gutter:10, padding:10, svgShowRange:true }).add(
    MyNode.new({ name:'foo', color:'red' }).add(
        MyNode.new(),
        MyNode.new().add(
            MyNode.new(),
            MyNode.new(),
        ),
    ),
    MyNode.new(),
    MyNode.new(),
    MyNode.new({ name:'bar', size:'2w', color:'blue', svgShowRange:true }).add(
        MyNode.new(),
        MyNode.new(),
    ),
    MyNode.new(),
)

const wrapper = document.querySelector('#svg-wrapper')
const check = document.querySelector('input[type=checkbox]')
check.checked = location.host.includes('localhost') === false

const WIDTH = 800
const HEIGHT = 300


let time = 0
const loop = () => {
    
    requestAnimationFrame(loop)

    if (check.checked || time === 0) {

        time += 1 / 60
    
        const node = root.find(n => n.style?.name === 'bar')
        node.style.size = `${(4 + 3 * Math.sin(time * 3)).toFixed(2)}w`
        
        wrapper.innerHTML = flex.treeToSvgString(root, { width:WIDTH, height:HEIGHT, margin:40 })
    }
}

loop()