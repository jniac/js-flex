const assert = require('assert')
const { test, describe, it, almostEquals } = require('../testbed.js')

const flex = require('../../../build/flex.common.js')

const main = () => {

    describe('2D:Layout', () => {

        it (`'width', 'height' trigger 2D layout`, () => {

            assert.equal(new flex.Layout({ height:300 }).is2D, true)
            assert.equal(new flex.Layout({ direction:'vertical', width:300 }).is2D, true)
        })

        it (`default 'direction' is "horizontal"`, () => {

            assert.equal(new flex.Layout({ width:1 }).direction, 'horizontal')
        })

        it(`depending on 'direction', 'width' & 'height' are transfered to normalLayout.size`, () => {

            assert.equal(new flex.Layout({ height:Math.PI }).normalLayout.size, Math.PI)
            assert.equal(new flex.Layout({ direction:'vertical', width:Math.PI }).normalLayout.size, Math.PI)
        })

        it(`getter|setter 'width|height' are correctly linked`, () => {

            const width = Math.PI
            const height = Math.E
            const H = new flex.Layout({ width, height })
            const V = new flex.Layout({ direction:'vertical', width, height })
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
    })
}

module.exports = main
