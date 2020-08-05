export const getWhiteSpaceSize = node => {

    const { paddingStart, paddingEnd, gutter } = node.layout
    return paddingStart + paddingEnd + Math.max(node.children.length - 1, 0) * gutter
}

export const getWhiteSpaceSize2D = (node, horizontal) => {

    const { gutter } = node.layout
    const { paddingStart, paddingEnd } = horizontal ? node.layout : node.layout.normal
    const gutterSpace = node.layout.isHorizontal === horizontal ? Math.max(node.children.length - 1, 0) * gutter : 0
    return paddingStart + paddingEnd + gutterSpace
}



const setOneSize = (node, horizontal, value) => {

    if (horizontal) {

        node.bounds.size = value
        node.selfHorizontalSizeReady = true

    } else {

        node.bounds.ensure2D().normal.size = value
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

export const computeSize2D = node => {

    if (!node.absoluteChildren)
        node.computeNodeByType()

    if (node.selfSizeReady) {
        // size has been computed, but proportional children are still waiting
        // (node.proportionalSizeReady is false)
        node.computeProportionalSize()
        return
    }

    if (!node.selfHorizontalSizeReady)
        computeOneSize2D(node, true)

    if (!node.selfVerticalSizeReady)
        computeOneSize2D(node, false)

    node.selfSizeReady = node.selfHorizontalSizeReady && node.selfVerticalSizeReady
}
