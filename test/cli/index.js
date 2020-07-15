const assert = require('assert')
const { test, describe, it, almostEquals } = require('./testbed.js')

const flex = require('../../build/flex.common.js')

const main = ({ verbose = false } = {}) => test({ verbose }, () => {

    describe('Layout', () => {

        it('padding * 2 = paddingStart + paddingEnd', () => {

            const padding = Math.random()
            const layout = new flex.Layout({ padding })

            assert.equal(padding * 2, layout.paddingStart + layout.paddingEnd)
        })
    })

    describe('flex.compute', () => {

        const someChildren = (n, props) => new Array(n).fill(null).map(() => new MyNode(props))

        class MyNode extends flex.Node {

            constructor(layout) {

                super()

                this.layout = layout
            }
        }

        {
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

            it(`SIMPLE: size should be ${total.toFixed(6)}...`, () => almostEquals(rootNode.bounds.size, total))
        }

        {
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

            it(`NESTED: size should be ${total.toFixed(6)}...`, () => almostEquals(rootNode.bounds.size, total))
        }

        // it('lol', () => {throw new Error('failed')})
    })
})

module.exports = main

if (require.main === module)
    main({ verbose:true })
