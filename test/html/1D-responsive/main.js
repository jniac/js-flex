import flex from '../../../src/index.js'
import MyNode from '../1D/MyNode.js'

const range = document.querySelector('input')

const N = {
    Red:(props) => MyNode.new({ size:() => innerWidth, color:'red', svgShowSize:true, ...props }),
    Blue:(props) => MyNode.new({ size:() => parseFloat(range.value), color:'blue', svgShowSize:true, ...props }),
    Abs:(props) => MyNode.new({ position:'absolute', absoluteAlign:'center', size:'100%', ...props }),
}

const root = MyNode.new({ size:'fit', gutter:100, padding:100, svgShowRange:true }).add(
    N.Red().add(
        N.Abs()
    ),
    N.Blue().add(
        N.Abs()
    ),
    N.Red().add(
        N.Abs()
    ),
    N.Blue().add(
        N.Abs()
    ),
    N.Red().add(
        N.Abs()
    ),
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