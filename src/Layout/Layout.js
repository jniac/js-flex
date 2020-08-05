
import Extension2D from './Extension2D.js'
import ExtensionShortHand from './ExtensionShortHand.js'

const defaultValues = {

    position: 'relative',
    direction: 'horizontal',

    absoluteAlign: 0,
    absoluteOffset: 0,

    // size: 'fit',
    size: '1w',

    gutter: 0,
    paddingStart: 0,
    paddingEnd: 0,

    order: 0,

    // almost identical to https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
    // difference ? "flex-start|end" simplified to "start|end"
    justify: 'center',
    // justify: 'start',
    // justify: 'end',
    // justify: 'space-between',
    // justify: 'space-around',

    alignItems: 'center',
}

const stringToNumber = string => {

    if (string.endsWith('%'))
        return parseFloat(string) / 100

    switch (string) {

        case 'start':
        case 'left':
            return 0

        case 'middle':
        case 'center':
            return .5

        case 'end':
        case 'right':
            return 1
    }

    throw new Error(`oups, invalid value "${string}"`)
}

export default class Layout {

    static get defaultValues() { return defaultValues }

    constructor(props = undefined) {

        if (props)
            this.assign(props)
    }

    assign(props) {

        Object.assign(this, props)

        return this
    }

    resolveAbsoluteOffset(parentBoundsSize) {

        const { absoluteOffset } = this

        if (typeof absoluteOffset === 'number')
            return absoluteOffset

        return stringToNumber(absoluteOffset) * parentBoundsSize
    }

    resolveAbsoluteAlign(selfBoundsSize) {

        const { absoluteAlign } = this

        if (typeof absoluteAlign === 'number')
            return absoluteAlign

        return -stringToNumber(absoluteAlign) * selfBoundsSize
    }

    /**
     * returns
     * @return {Array} [freeOffset, extraGutter, extraPaddingStart]
     */
    getJustifyValues(freeSpace, gutterCount, extra) {

        const { justify } = this

        if (justify.endsWith('%')) {

            return [parseFloat(justify) / 100, 0, 0]
        }

        let freeOffset = 0
        let extraGutter = 0
        let extraPaddingStart = 0

        switch (justify) {

            case 'start':
                freeOffset = 0
                break

            default:
            case 'center':
                freeOffset = .5
                break

            case 'end':
                freeOffset = 1
                break

            case 'space-between':

                if (gutterCount === 0) {

                    freeOffset = .5

                } else {

                    extraGutter = freeSpace / gutterCount
                }
                break

            case 'space-evenly':

                if (gutterCount === 0) {

                    freeOffset = .5

                } else {

                    extraGutter = freeSpace / (gutterCount + 2)
                    extraPaddingStart = extraGutter
                }
                break

            case 'space-around':

                if (gutterCount === 0) {

                    freeOffset = .5

                } else {

                    extraGutter = freeSpace / (gutterCount + 1)
                    extraPaddingStart = extraGutter / 2
                }
                break
        }

        return [freeOffset, extraGutter, extraPaddingStart]
    }
}

Object.assign(Layout.prototype, defaultValues)

Extension2D(Layout)
ExtensionShortHand(Layout)
