const assert = require('assert')
const flex = require('../build/flex.common.js')

const reasonablyEquals = (a, b, epsilon = 1e-6) => {

    if (Math.abs(a - b) > epsilon)
        throw new Error(`'a' is not reasonably equal to 'b': ${a} ≠ ${b}`)
}

class MyNode extends flex.Node {

    constructor(layout) {

        super()

        this.layout = layout
    }
}

const someChildren = (n, props) => new Array(n).fill(null).map(() => new MyNode(props))

describe('Layout.padding', () => {

    const padding = Math.random()
    const layout = new flex.Layout({ padding })

    it(`paddingStart & paddingEnd should equals padding`, () =>
        assert.equal(padding * 2, layout.paddingStart + layout.paddingEnd))
})

describe('size: "fit"', () => {

    let title

    {
        title = 'SIMPLE'

        const paddingStart = 3 + Math.random()
        const paddingEnd = 3 + Math.random()
        const gutter = 2 + Math.random()
        const size = 5 + Math.random()

        const { rootNode } = flex.compute(
            new MyNode({
                size: 'fit',
                paddingStart,
                paddingEnd,
                gutter,
            })
            .add(...someChildren(3, { size }))
        )

        const total = paddingStart + paddingEnd + size * 3 + gutter * 2

        it(`${title}: size should be ${total.toFixed(6)}...`, () => reasonablyEquals(rootNode.bounds.size, total))
    }

    {
        title = 'NESTED'

        const padding = 3 + Math.random()
        const gutter = 2 + Math.random()
        const size = 5 + Math.random()

        const node = new MyNode({
            size: 'fit',
            padding,
            gutter,
        })
        .add(...someChildren(3, { size }))
        .add(new MyNode({
            size: 'fit',
            padding,
            gutter,
        }).add(...someChildren(3, { size })))

        const { rootNode } = flex.compute(node)

        const total = padding * 2 + size * 3 + gutter * 3 +
            // last child
            padding * 2 + size * 3 + gutter * 2

        it(`${title}: size should be ${total.toFixed(6)}...`, () => reasonablyEquals(rootNode.bounds.size, total))
    }
})
