import getNodeStyleSize from './getNodeStyleSize.js'

export default node => {

    // position type
    node.absoluteChildren = []
    node.nonAbsoluteChildren = []

    // size type
    node.fixedChildren = []
    node.relativeChildren = []
    node.proportionalChildren = []

    for (const child of node.children) {

        const { position } = child.style
        const size = getNodeStyleSize(child)

        if (position === 'absolute') {

            node.absoluteChildren.push(child)
            continue
        }

        node.nonAbsoluteChildren.push(child)

        if (typeof size === 'string') {

            if (size.endsWith('w')) {

                child.proportionalWeight = parseFloat(size)
                node.proportionalChildren.push(child)

            } else if (size.endsWith('%') || size === 'fit' || size === 'fill') {

                node.relativeChildren.push(child)

            } else if (/^\d$/.test(size)) {

                node.fixedChildren.push(child)

            } else {

                throw new Error(`Invalid size value: "${size}"`)
            }

        } else if (typeof size === 'number') {

            node.fixedChildren.push(child)

        } else {

            throw new Error(`Invalid size value: "${size}"`)
        }

    }

    node.proportionalSizeReady = node.proportionalChildren.length === 0
}
