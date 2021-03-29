// handle the special "fill" value
export default node => {

    const { size } = node.style

    if (typeof size === 'function')
        return size(node)

    if (size === 'fill')
        return '1w'

    return size
}
