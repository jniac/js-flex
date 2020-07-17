
import Extension2D from './Extension2D.js'
import ExtensionShortHand from './ExtensionShortHand.js'

const defaultValues = {

    position: 'relative',
    direction: 'horizontal',

    align: 0,
    offset: 0,

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

    resolveOffset(parentBoundsSize) {

        const { offset } = this

        if (typeof offset === 'number')
            return offset

        return stringToNumber(offset) * parentBoundsSize
    }

    resolveAlign(selfBoundsSize) {

        const { align } = this

        if (typeof align === 'number')
            return align

        return -stringToNumber(align) * selfBoundsSize
    }

    /**
     * returns
     * @return {Array} [align, extraGutter, extraPaddingStart]
     */
    getJustifyValues(freeSpace, gutterCount, extra) {

        const { justify } = this

        if (justify.endsWith('%')) {

            return [parseFloat(justify) / 100, 0, 0]
        }

        let align = 0
        let extraGutter = 0
        let extraPaddingStart = 0

        switch (justify) {

            case 'start':
                align = 0
                break

            default:
            case 'center':
                align = .5
                break

            case 'end':
                align = 1
                break

            case 'space-between':

                if (gutterCount === 0) {

                    align = .5

                } else {

                    extraGutter = freeSpace / gutterCount
                }
                break

            case 'space-evenly':

                if (gutterCount === 0) {

                    align = .5

                } else {

                    extraGutter = freeSpace / (gutterCount + 2)
                    extraPaddingStart = extraGutter
                }
                break

            case 'space-around':

                if (gutterCount === 0) {

                    align = .5

                } else {

                    extraGutter = freeSpace / (gutterCount + 1)
                    extraPaddingStart = extraGutter / 2
                }
                break
        }

        return [align, extraGutter, extraPaddingStart]
    }
}

Object.assign(Layout.prototype, defaultValues)

Extension2D(Layout)
ExtensionShortHand(Layout)
