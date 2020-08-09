import nodeByType2D from './nodeByType2D.js'
import getNodeLayoutSize2D from './getNodeLayoutSize2D.js'

import {
    sizeIsProportional,
    sizeIsRelative,
} from './utils.js'

const getBounds = (node, horizontal) => horizontal ? node.bounds : node.bounds.normal

const isDirectionSizeReady = (node, horizontal) => !!node && (horizontal
    ? node.selfHorizontalSizeReady
    : node.selfVerticalSizeReady
)

const getWhiteSpaceSize2D = (node, horizontal) => {

    const { gutter } = node.layout
    const { paddingStart, paddingEnd } = horizontal ? node.layout : node.layout.normal

    const gutterSpace =
        node.layout.isHorizontal === horizontal ?
        Math.max(node.children.length - 1, 0) * gutter : 0

    return paddingStart + paddingEnd + gutterSpace
}

const setBoundsSize = (node, horizontal, value) => {

    if (horizontal) {

        node.bounds.size = value
        node.selfHorizontalSizeReady = true

    } else {

        node.bounds.ensureNormal().normal.size = value
        node.selfVerticalSizeReady = true
    }

    node.selfSizeReady = node.selfHorizontalSizeReady && node.selfVerticalSizeReady
}

const proportionalSize = node => {

    const { isHorizontal:horizontal } = node.layout

    const relativeChildrenSpace = node.relativeChildren.reduce((total, child) => total + getBounds(child, horizontal).size, 0)
    const fixedChildrenSpace = node.fixedChildren.reduce((total, child) => total + getBounds(child, horizontal).size, 0)
    const freeSpace = getBounds(node, horizontal).size - getWhiteSpaceSize2D(node, horizontal) - relativeChildrenSpace - fixedChildrenSpace

    const totalWeight = node.proportionalChildren.reduce((total, child) => total + child.proportionalWeight, 0)

    for (const child of node.proportionalChildren) {

        setBoundsSize(child, horizontal, freeSpace * child.proportionalWeight / totalWeight)
    }

    node.proportionalSizeReady = true
}

// sum of all the non-absolute children
const regularFitSize = (node, horizontal) => {

    let space = 0

    for (const child of node.nonAbsoluteChildren) {

        if (!isDirectionSizeReady(child, horizontal)) {

            const size = getNodeLayoutSize2D(child, horizontal)

            if (sizeIsProportional(size)) {

                // proportional children in the direction (regular) of a "fit" container are non-sense
                // no error, but 0 size will end there
                setBoundsSize(child, horizontal, 0)

            } else {

                return
            }
        }

        space += getBounds(child, horizontal).size
    }

    space += getWhiteSpaceSize2D(node, horizontal)

    setBoundsSize(node, horizontal, space)
}

// get the biggest child, add whitespace
const oppositeFitSize = (node, horizontal) => {

    let space = 0

    for (const child of node.nonAbsoluteChildren) {

        if (!isDirectionSizeReady(child, horizontal)) {

            const size = getNodeLayoutSize2D(child, horizontal)

            if (sizeIsRelative(size)) {

                continue

            } else {

                return
            }
        }

        space = Math.max(space, getBounds(child, horizontal).size)
    }

    space += getWhiteSpaceSize2D(node, horizontal)

    setBoundsSize(node, horizontal, space)
}

const computeOneSize2D = (node, horizontal) => {

    const size = getNodeLayoutSize2D(node, horizontal)

    if (typeof size === 'number') {

        setBoundsSize(node, horizontal, size)

    } else if (size === 'fit') {

        if (node.layout.isHorizontal === horizontal) {

            regularFitSize(node, horizontal)

        } else {

            oppositeFitSize(node, horizontal)
        }

    } else if (sizeIsRelative(size)) {

        if (!isDirectionSizeReady(node.parent, horizontal))
            return

        const x = parseFloat(size) / 100
        const relativeSpace = node.layout.position === 'absolute'
            ? getBounds(node.parent, horizontal).size
            : getBounds(node.parent, horizontal).size - getWhiteSpaceSize2D(node.parent, horizontal)

        setBoundsSize(node, horizontal, relativeSpace * x)
    }
}

export default node => {

    node.bounds.ensureNormal()

    if (!node.absoluteChildren)
        nodeByType2D(node)

    if (isDirectionSizeReady(node, node.layout.isHorizontal)) {
        // size has been computed, but proportional children are still waiting
        // (node.proportionalSizeReady is false)
        proportionalSize(node)
    }

    if (!node.selfHorizontalSizeReady)
        computeOneSize2D(node, true)

    if (!node.selfVerticalSizeReady)
        computeOneSize2D(node, false)
}
