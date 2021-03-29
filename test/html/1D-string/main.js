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

const WIDTH = 120
const HEIGHT = 16

const textarea = document.querySelector('textarea')
const check = document.querySelector('input[type=checkbox]')
textarea.cols = WIDTH - 2 // why???? dunno...
textarea.rows = HEIGHT

let time = 0
const loop = () => {
    
    requestAnimationFrame(loop)

    if (check.checked) {

        flex.compute(root)
        
        const node = root.find(n => n.style?.name === 'bar')
        node.style.size = `${(4 + 3 * Math.sin(time * 3)).toFixed(2)}w`
        
        // textarea.value = new Array(HEIGHT).fill(''.padEnd(WIDTH, '0123456789')).join('\n')
        textarea.value = flex.treeToString(root, { width:WIDTH, height:HEIGHT })
        
                time += 1 / 60
    }
}

loop()