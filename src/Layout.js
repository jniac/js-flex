
const defaultValues = {

    position: 'relative',
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

export default class Layout {

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

    /**
     * returns
     * @return {Array} [align, extraGutter]
     */
    getJustifyContentValues(freeSpace, gutterCount) {

        const { justifyContent } = this

        if (justifyContent.endsWith('%')) {

            return [parseFloat(justifyContent) / 100, 0]
        }

        switch (justifyContent) {

            case 'start':
                return [0, 0]

            default:
            case 'center':
                return [.5, 0]

            case 'end':
                return [1, 0]

            case 'space-between':
                return gutterCount === 0 ? [.5, 0] : [0, freeSpace / gutterCount]

            case 'space-around':
                throw new Error(`justifyContent "${justifyContent}" value not implemented!`)
        }
    }
}

Object.assign(Layout.prototype, defaultValues)
