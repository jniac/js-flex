export const getWhiteSpaceSize = node => {

    const { paddingStart, paddingEnd, gutter } = node.layout
    return paddingStart + paddingEnd + Math.max(node.children.length - 1, 0) * gutter
}

export const getWhiteSpaceSize2D = (node, horizontal) => {

    const { gutter } = node.layout
    const { paddingStart, paddingEnd } = horizontal ? node.layout : node.layout.normal

    const gutterSpace =
        node.layout.isHorizontal === horizontal ?
        Math.max(node.children.length - 1, 0) * gutter : 0

    return paddingStart + paddingEnd + gutterSpace
}
