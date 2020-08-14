import flex from '../../../src/index.js'

export default class MyNode extends flex.Node {

    static repeat(n, style) {

        if (typeof style === 'function')
            return new Array(n).fill().map((v, index) => new MyNode(style(index)))

        return new Array(n).fill().map(() => new MyNode(style))
    }

    static new(style) { return new MyNode(style) }

    constructor(style) {

        super()

        this.style = style
    }
}
