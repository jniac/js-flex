import { getWhiteSpaceSize } from './functions.js'

const computeProportionalSize = node => {

    const relativeChildrenSpace = node.relativeChildren.reduce((total, child) => total + child.bounds.size, 0)
    const fixedChildrenSpace = node.fixedChildren.reduce((total, child) => total + child.bounds.size, 0)
    const freeSpace = node.bounds.size - getWhiteSpaceSize(node) - relativeChildrenSpace - fixedChildrenSpace

    const totalWeight = node.proportionalChildren.reduce((total, child) => total + child.proportionalWeight, 0)

    for (const child of node.proportionalChildren) {

        child.bounds.size = freeSpace * child.proportionalWeight / totalWeight
        child.selfSizeReady = true
    }

    node.proportionalSizeReady = true
}



export default node => {

    if (!node.absoluteChildren)
        node.computeNodeByType()

    if (node.selfSizeReady) {
        // size has been computed, but proportional children are still waiting
        // (node.proportionalSizeReady is false)
        computeProportionalSize(node)
        return
    }

    const { size } = node.layout

    if (typeof size === 'number') {

        node.bounds.size = size
        node.selfSizeReady = true

    } else if (size === 'fit') {

        let space = 0

        for (const child of node.nonAbsoluteChildren) {

            if (!child.selfSizeReady)
                return

            space += child.bounds.size
        }

        space += getWhiteSpaceSize(node)

        node.bounds.size = space
        node.selfSizeReady = true

    } else if (size.endsWith('%')) {

        if (!node.parent?.selfSizeReady)
            return

        const x = parseFloat(size) / 100
        const relativeSpace = node.layout.position === 'absolute'
            ? node.parent.bounds.size
            : node.parent.bounds.size - getWhiteSpaceSize(node.parent)
        node.bounds.size = relativeSpace * x
        node.selfSizeReady = true
    }
}
