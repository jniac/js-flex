// handle the special "fill" value
export default node => {

    const { size } = node.style

    if (size === 'fill')
        return '1w'

    return size
}
