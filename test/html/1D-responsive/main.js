import flex from '../../../src/index.js'
import MyNode from '../1D/MyNode.js'

const range = document.querySelector('input')

const root = MyNode.new({ size:'fit', gutter:100, padding:100, svgShowRange:true }).add(
    MyNode.new({ size:() => innerWidth, color:'red', svgShowSize:true }),
    MyNode.new({ size:() => parseFloat(range.value), color:'blue', svgShowSize:true }),
    MyNode.new({ size:() => innerWidth, color:'red', svgShowSize:true }),
    MyNode.new({ size:() => parseFloat(range.value), color:'blue', svgShowSize:true }),
    MyNode.new({ size:() => innerWidth, color:'red', svgShowSize:true }),
)

const wrapper = document.querySelector('#svg-wrapper')

const SVG_WIDTH = 800
const SVG_HEIGHT = 300

const render = () => {
    flex.compute(root)
    wrapper.innerHTML = flex.treeToSvgString(root, { width:SVG_WIDTH, height:SVG_HEIGHT, margin:40 })
}

range.oninput = () => render()

render()

window.addEventListener('resize', () => render())