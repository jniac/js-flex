
const defaultValues = {

    position: 'relative',
    align: 0,
    offset: 0,

    // size: 'fit',
    size: 10,

    gutter: 10,
    paddingStart: 20,
    paddingEnd: 20,

    order: 0,

    // almost identical to https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
    // difference ? "flex-start|end" simplified to "start|end"
    justifyContent: 'center',
    // justifyContent: 'start',
    // justifyContent: 'end',
    // justifyContent: 'space-between',
    // justifyContent: 'space-around',
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

    constructor(props) {

        this.assign(props)
    }

    assign({ padding, ...props } = {}) {

        if (padding !== undefined) {

            props.paddingStart =
            props.paddingEnd = padding
        }

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
    getJustifyContentValues(freeSpace, gutterCount, extra) {

        const { justifyContent } = this

        if (justifyContent.endsWith('%')) {

            return [parseFloat(justifyContent) / 100, 0, 0]
        }

        let align = 0
        let extraGutter = 0
        let extraPaddingStart = 0

        switch (justifyContent) {

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
