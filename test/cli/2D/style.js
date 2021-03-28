const assert = require('assert')
const { describe, it } = require('../testbed.js')

const flex = require('../../../build/flex.common.js')
const { Style } = flex

const main = () => {

    describe('2D:Style', () => {

        it (`'width' triggers 2D style`, () => {

            assert.strictEqual(new Style({ height:300 }).is2D, true)
        })

        it (`default 'direction' is "horizontal"`, () => {

            assert.strictEqual(new Style({ width:1 }).direction, 'horizontal')
        })

        it(`depending on 'direction', 'height' is transfered to normal.size`, () => {

            assert.strictEqual(new Style({ height:Math.PI }).normal.size, Math.PI)
        })

        it(`getter|setter 'width|height' are correctly linked`, () => {

            const width = Math.PI
            const height = Math.E
            const H = new Style({ width, height })
            const V = new Style({ direction:'vertical', width, height })
            assert.strictEqual(H.width, width)
            assert.strictEqual(H.height, height)
            assert.strictEqual(V.width, width)
            assert.strictEqual(V.height, height)

            H.width = 4
            H.height = 3
            V.width = 4
            V.height = 3
            assert.strictEqual(H.width, 4)
            assert.strictEqual(H.height, 3)
            assert.strictEqual(V.width, 4)
            assert.strictEqual(V.height, 3)
        })

        it(`Style.keys & Style.splitProps`, () => {

            const props = { lol:43 }

            for (const key of Style.keys)
                props[key] = Math.random()

            const [style, rest] = Style.splitProps(props)

            assert.strictEqual(Object.keys(style).length, Style.keys.length)
            assert.strictEqual(Object.keys(rest).length, 1)
            assert.strictEqual(rest.lol, props.lol)
        })
    })
}

module.exports = main
