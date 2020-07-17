import flex from '../../src/index.js'
import testBed from './testBed.js'
import getDisplay from './getDisplay.js'

const consoleLog = testBed.subscribe('#f09')



class MyNode extends flex.Node {

    static repeat(n, layout) {

        if (typeof layout === 'function')
            return new Array(n).fill().map((v, index) => new MyNode(layout(index)))

        return new Array(n).fill().map(() => new MyNode(layout))
    }

    static new(layout) { return new MyNode(layout) }

    static horizontal(layout) { return new MyNode({ ...layout, flexDirection:'horizontal' }) }
    static vertical(layout) { return new MyNode({ ...layout, flexDirection:'vertical' }) }

    constructor(layout) {

        super()

        this.layout = layout
    }

    setLayout(layout) {

        Object.assign(this.layout, layout)

        return this
    }

    fillHorizontal(layout) { return this.setLayout({ ...layout, width:'1w', height:'100%' }) }
    fillVertical(layout) { return this.setLayout({ ...layout, width:'100%', height:'1w' }) }
}

const root = MyNode.horizontal({ width:600, height:300, gutter:10, padding:10 }).add(
    MyNode.horizontal().add(
        MyNode.horizontal().add(
            MyNode.horizontal(),
            MyNode.horizontal(),
            MyNode.vertical().add(
                MyNode.vertical(),
                MyNode.vertical(),
                MyNode.horizontal(),
            ),
        ),
    ),
    MyNode.horizontal(),
    MyNode.vertical().add(
        MyNode.horizontal(),
        MyNode.vertical().add(
            MyNode.vertical(),
            MyNode.vertical(),
            MyNode.vertical(),
        ),
    ),
    MyNode.vertical(),
)

Object.assign(globalThis, { root })

for (const node of root.flat({ includeSelf:false }))
    node.parent.layout.flexDirection === 'vertical' ? node.fillVertical() : node.fillHorizontal()

const { canvas } = getDisplay('2D')
