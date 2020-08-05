// handle the special "fill" value
export default (node, horizontal) => {

    const layout = horizontal ? node.layout : node.layout.normal
    const { size } = layout

    if (size === 'fill')
        return horizontal === node.parent.layout.isHorizontal ? '1w' : '100%'

    return size
}
