import flex from '../../../src/index.js'

export default class MyNode extends flex.Node {

    static repeat(n, layout) {

        if (typeof layout === 'function')
            return new Array(n).fill().map((v, index) => new MyNode(layout(index)))

        return new Array(n).fill().map(() => new MyNode(layout))
    }

    static new(layout) { return new MyNode(layout) }

    static horizontal(layout) { return new MyNode({ ...layout, direction:'horizontal' }) }
    static vertical(layout) { return new MyNode({ ...layout, direction:'vertical' }) }

    constructor(layout) {

        super()

        this.layout = {}

        this.setLayout({ width:'fill', height:'fill', ...layout})
    }

    setLayout(layout) {

        Object.assign(this.layout, layout)

        return this
    }

    fillHorizontal(layout) { return this.setLayout({ ...layout, width:'1w', height:'100%' }) }
    fillVertical(layout) { return this.setLayout({ ...layout, width:'100%', height:'1w' }) }
    fill(layout) { return this.parent.layout.direction === 'vertical' ? this.fillVertical(layout) : this.fillHorizontal(layout)}
}
