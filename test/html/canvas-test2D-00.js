import flex from '../../src/index.js'
import testBed from './testBed.js'

const consoleLog = testBed.subscribe('#f09')

//
class MyNode extends flex.Node {

    static repeat(n, layout) {

        if (typeof layout === 'function')
            return new Array(n).fill().map((v, index) => new MyNode(layout(index)))

        return new Array(n).fill().map(() => new MyNode(layout))
    }

    static new(layout) { return new MyNode(layout) }

    constructor(layout) {

        super()

        this.layout = layout
    }
}

const root = MyNode.new({ width:600, height:300, gutter:10, padding:10 }).add(
)
