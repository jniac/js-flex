import {
    stringIsPureNumber,
    sizeIsRelative,
    sizeIsOppositeRelative,
} from './utils.js'

import getNodeStyleSize2D from './getNodeStyleSize2D.js'

export default node => {

    const { horizontal } = node.style

    // position type
    node.absoluteChildren = []
    node.nonAbsoluteChildren = []

    // size type
    node.fixedChildren = []
    node.relativeChildren = []
    node.proportionalChildren = []

    for (const child of node.children) {

        const { position } = child.style
        const size = getNodeStyleSize2D(child, horizontal)

        if (position === 'absolute') {

            node.absoluteChildren.push(child)
            continue
        }

        node.nonAbsoluteChildren.push(child)

        if (stringIsPureNumber(size)) {

            node.fixedChildren.push(child)

        } else if (typeof size === 'string') {

            if (size.endsWith('w')) {

                child.proportionalWeight = parseFloat(size)
                node.proportionalChildren.push(child)

            } else if (
                sizeIsRelative('%') ||
                sizeIsOppositeRelative('op') ||
                size === 'fit' || size === 'fill') {

                node.relativeChildren.push(child)

            } else {

                throw new Error(`Invalid size value: "${size}"`)
            }

        } else {

            throw new Error(`Invalid size value: ${size} (${typeof size})`)
        }

    }

    node.proportionalSizeReady = node.proportionalChildren.length === 0
}
