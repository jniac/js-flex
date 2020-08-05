import { getWhiteSpaceSize2D } from './functions.js'

const setOneSize = (node, horizontal, value) => {

    if (horizontal) {

        node.bounds.size = value
        node.selfHorizontalSizeReady = true

    } else {

        node.bounds.ensureNormal().normal.size = value
        node.selfVerticalSizeReady = true
    }
}

const computeOneSize2D = (node, horizontal) => {

    const size = horizontal ? node.layout.size : node.layout.normal.size

    if (typeof size === 'number') {

        setOneSize(node, horizontal, size)

    } else if (size === 'fit') {

        let space = 0

        for (const child of node.nonAbsoluteChildren) {

            if (!child.selfHorizontalSizeReady)
                return

            space += child.bounds.getSize2D(horizontal)
        }

        space += getWhiteSpaceSize2D(node, horizontal)

        setOneSize(node, horizontal, space)

    } else if (size.endsWith('%')) {

        if (!node.parent?.selfHorizontalSizeReady)
            return

        const x = parseFloat(size) / 100
        const relativeSpace = node.layout.position === 'absolute'
            ? node.parent.bounds.getSize2D(horizontal)
            : node.parent.bounds.getSize2D(horizontal) - getWhiteSpaceSize2D(node.parent, horizontal)

        setOneSize(node, horizontal, relativeSpace * x)
    }
}

export default node => {

    if (!node.absoluteChildren)
        node.computeNodeByType()

    if (node.selfSizeReady) {
        // size has been computed, but proportional children are still waiting
        // (node.proportionalSizeReady is false)
        // node.computeProportionalSize()
        return
    }

    if (!node.selfHorizontalSizeReady)
        computeOneSize2D(node, true)

    if (!node.selfVerticalSizeReady)
        computeOneSize2D(node, false)

    node.selfSizeReady = node.selfHorizontalSizeReady && node.selfVerticalSizeReady
}
