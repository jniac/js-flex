const orderSorter = (A, B) => A.style.order < B.style.order ? -1 : 1

const computeNonAbsoluteChildren = node => {

    const { paddingStart, paddingEnd, gutter } = node.style

    const gutterCount = Math.max(0, node.nonAbsoluteChildren.length - 1)
    const freeSpace = node.bounds.size
        - paddingStart
        - paddingEnd
        - gutterCount * gutter
        - node.nonAbsoluteChildren.reduce((total, child) => total + child.bounds.size, 0)

    const [freeOffset, extraGutter, extraPaddingStart] = node.style.getJustifyValues(freeSpace, gutterCount)

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
            child.style.resolveAbsoluteOffset(node.bounds.size) +
            child.style.resolveAbsoluteAlign(child.bounds.size)

        child.bounds.localPosition = localPosition
        child.bounds.position = node.bounds.position + localPosition
    }
}

export default node => {

    node.nonAbsoluteChildren.sort(orderSorter)

    computeNonAbsoluteChildren(node)
    computeAbsoluteChildren(node)
}
