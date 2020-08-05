import { getWhiteSpaceSize2D } from './functions.js'
import nodeByType2D from './nodeByType2D.js'

const getBounds = (node, horizontal) => horizontal ? node.bounds : node.bounds.normal

const isDirectionSizeReady = (node, horizontal) => !!node && (horizontal
    ? node.selfHorizontalSizeReady
    : node.selfVerticalSizeReady
)

const setBoundsSize = (node, horizontal, value) => {

    if (horizontal) {

        node.bounds.size = value
        node.selfHorizontalSizeReady = true

    } else {

        node.bounds.ensureNormal().normal.size = value
        node.selfVerticalSizeReady = true
    }
}

const computeProportionalSize2D = node => {

    const { isHorizontal:horizontal } = node.layout

    const relativeChildrenSpace = node.relativeChildren.reduce((total, child) => total + child.bounds.size, 0)
    const fixedChildrenSpace = node.fixedChildren.reduce((total, child) => total + child.bounds.size, 0)
    const freeSpace = getBounds(node, horizontal).size - getWhiteSpaceSize2D(node, horizontal) - relativeChildrenSpace - fixedChildrenSpace

    const totalWeight = node.proportionalChildren.reduce((total, child) => total + child.proportionalWeight, 0)

    for (const child of node.proportionalChildren) {

        setBoundsSize(child, horizontal, freeSpace * child.proportionalWeight / totalWeight)
    }

    node.proportionalSizeReady = true
}

const computeOneSize2D = (node, horizontal, debug) => {

    const size = horizontal ? node.layout.size : node.layout.normal.size

    if (debug)
        console.log({ size, horizontal })

    if (typeof size === 'number') {

        setBoundsSize(node, horizontal, size)

    } else if (size === 'fit') {

        let space = 0

        for (const child of node.nonAbsoluteChildren) {

            if (!isDirectionSizeReady(child, horizontal))
                return

            space += child.bounds.getSize2D(horizontal)
        }

        space += getWhiteSpaceSize2D(node, horizontal)

        setBoundsSize(node, horizontal, space)

    } else if (size.endsWith('%')) {

        if (!isDirectionSizeReady(node.parent, horizontal))
            return

        const x = parseFloat(size) / 100
        const relativeSpace = node.layout.position === 'absolute'
            ? node.parent.bounds.getSize2D(horizontal)
            : node.parent.bounds.getSize2D(horizontal) - getWhiteSpaceSize2D(node.parent, horizontal)

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
        computeProportionalSize2D(node)
        return
    }

    if (!node.selfHorizontalSizeReady)
        computeOneSize2D(node, true)

    if (!node.selfVerticalSizeReady)
        computeOneSize2D(node, false)

    node.selfSizeReady = node.selfHorizontalSizeReady && node.selfVerticalSizeReady
}
