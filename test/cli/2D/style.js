const assert = require('assert')
const { test, describe, it, almostEquals } = require('../testbed.js')

const flex = require('../../../build/flex.common.js')
const { Style } = flex

const main = () => {

    describe('2D:Style', () => {

        it (`'width' triggers 2D style`, () => {

            assert.equal(new Style({ height:300 }).is2D, true)
        })

        it (`default 'direction' is "horizontal"`, () => {

            assert.equal(new Style({ width:1 }).direction, 'horizontal')
        })

        it(`depending on 'direction', 'height' is transfered to normal.size`, () => {

            assert.equal(new Style({ height:Math.PI }).normal.size, Math.PI)
        })

        it(`getter|setter 'width|height' are correctly linked`, () => {

            const width = Math.PI
            const height = Math.E
            const H = new Style({ width, height })
            const V = new Style({ direction:'vertical', width, height })
            assert.equal(H.width, width)
            assert.equal(H.height, height)
            assert.equal(V.width, width)
            assert.equal(V.height, height)

            H.width = 4
            H.height = 3
            V.width = 4
            V.height = 3
            assert.equal(H.width, 4)
            assert.equal(H.height, 3)
            assert.equal(V.width, 4)
            assert.equal(V.height, 3)
        })

        it(`Style.keys & Style.splitKeys`, () => {

            const props = { lol:43 }

            for (const key of Style.keys)
                props[key] = Math.random()

            const [style, rest] = Style.splitKeys(props)

            assert.equal(Object.keys(style).length, Style.keys.length)
            assert.equal(Object.keys(rest).length, 1)
            assert.equal(rest.lol, props.lol)
        })
    })
}

module.exports = main
