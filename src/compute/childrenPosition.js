const orderSorter = (A, B) => A.layout.order < B.layout.order ? -1 : 1

const computeNonAbsoluteChildren = node => {

    const { paddingStart, paddingEnd, gutter } = node.layout

    const gutterCount = Math.max(0, node.nonAbsoluteChildren.length - 1)
    const freeSpace = node.bounds.size
        - paddingStart
        - paddingEnd
        - gutterCount * gutter
        - node.nonAbsoluteChildren.reduce((total, child) => total + child.bounds.size, 0)

    const [freeOffset, extraGutter, extraPaddingStart] = node.layout.getJustifyValues(freeSpace, gutterCount)

    let localPosition = paddingStart + extraPaddingStart + freeOffset * freeSpace

    for (const child of node.nonAbsoluteChildren) {

        child.bounds.localPosition = localPosition
        child.bounds.position = node.bounds.position + localPosition

        localPosition += child.bounds.size + gutter + extraGutter
    }
}

const computeAbsoluteChildren = node => {

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

    computeNonAbsoluteChildren(node)
    computeAbsoluteChildren(node)
}
