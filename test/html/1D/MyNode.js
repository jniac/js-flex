import flex from '../../../src/index.js'

export default class MyNode extends flex.Node {

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
