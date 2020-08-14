import flex from '../../../src/index.js'

export default class MyNode extends flex.Node {

    static repeat(n, style) {

        if (typeof style === 'function')
            return new Array(n).fill().map((v, index) => new MyNode(style(index)))

        return new Array(n).fill().map(() => new MyNode(style))
    }

    static new(style) { return new MyNode(style) }

    static horizontal(style) { return new MyNode({ ...style, direction:'horizontal' }) }
    static vertical(style) { return new MyNode({ ...style, direction:'vertical' }) }

    constructor(style) {

        super()

        this.style = {}

        this.setStyle({ width:'fill', height:'fill', ...style })
    }

    setStyle(style) {

        Object.assign(this.style, style)

        return this
    }

    fillHorizontal(style) { return this.setStyle({ ...style, width:'1w', height:'100%' }) }
    fillVertical(style) { return this.setStyle({ ...style, width:'100%', height:'1w' }) }
    fill(style) { return this.parent.style.direction === 'vertical' ? this.fillVertical(style) : this.fillHorizontal(style)}
}
