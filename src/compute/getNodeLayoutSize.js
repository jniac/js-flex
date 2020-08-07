// handle the special "fill" value
export default node => {

    const { size } = node.layout

    if (size === 'fill')
        return '1w'

    return size
}
