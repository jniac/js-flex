import getJustifyValues from '../Layout/getJustifyValues.js'

const orderSorter = (A, B) => A.layout.order < B.layout.order ? -1 : 1

const getBounds = (node, horizontal) => horizontal ? node.bounds : node.bounds.normal

const computeNonAbsoluteRegularPosition = node => {

    const { justify, gutter, isHorizontal:horizontal } = node.layout
    const { paddingStart, paddingEnd } = horizontal ? node.layout : node.layout.normal

    const nodeBounds = getBounds(node, horizontal)
    const gutterCount = Math.max(0, node.nonAbsoluteChildren.length - 1)
    const freeSpace = nodeBounds.size
        - paddingStart
        - paddingEnd
        - gutterCount * gutter
        - node.nonAbsoluteChildren.reduce((total, child) => total + getBounds(child, horizontal).size, 0)

    const [freeOffset, extraGutter, extraPaddingStart] = getJustifyValues(justify, freeSpace, gutterCount)

    let localPosition = paddingStart + extraPaddingStart + freeOffset * freeSpace

    for (const child of node.nonAbsoluteChildren) {

        const childBounds = getBounds(child, horizontal)
        childBounds.localPosition = localPosition
        childBounds.position = nodeBounds.position + localPosition

        localPosition += childBounds.size + gutter + extraGutter
    }
}

const computeNonAbsoluteOppositePosition = node => {

    const { justifyNormal, isHorizontal:horizontal } = node.layout
    const { paddingStart, paddingEnd } = !horizontal ? node.layout : node.layout.normal
    const nodeBounds = getBounds(node, !horizontal)

    for (const child of node.nonAbsoluteChildren) {

        const freeSpace = nodeBounds.size
            - paddingStart
            - paddingEnd
            - getBounds(child, !horizontal).size

        const [freeOffset, , extraPaddingStart] = getJustifyValues(justifyNormal, freeSpace, 0)

        const localPosition = paddingStart + extraPaddingStart + freeOffset * freeSpace

        const childBounds = getBounds(child, !horizontal)
        childBounds.localPosition = localPosition
        childBounds.position = nodeBounds.position + localPosition
    }
}

const computeAbsoluteChildren2D = node => {

    for (const child of node.absoluteChildren) {

        const localPosition =
            child.layout.resolveAbsoluteOffset(node.bounds.size) +
            child.layout.resolveAbsoluteAlign(child.bounds.size)

        child.bounds.localPosition = localPosition
        child.bounds.position = node.bounds.position + localPosition
    }
}

export default node => {

    node.nonAbsoluteChildren.sort(orderSorter)

    computeNonAbsoluteRegularPosition(node)
    computeNonAbsoluteOppositePosition(node)
    // computeAbsoluteChildren2D(node)
}
