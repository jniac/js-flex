import { sizeIsProportional, stringIsPureNumber } from './utils.js'

// NOTE:
// handling a quite non-sense case:
// size is proportional but the parent is NOT in the same direction, or the parent does not exist (root)
const sizeIsProportionalButDoesNotMakeSense = (size, horizontal, parent) =>
    sizeIsProportional(size) && (!parent || parent.style.horizontal !== horizontal)

export default (node, horizontal) => {

    const style = horizontal ? node.style : node.style.normal
    const { size } = style

    // handle the special "fill" value
    if (size === 'fill')
        return horizontal === node.parent.style.horizontal ? '1w' : '100%'

    if (sizeIsProportionalButDoesNotMakeSense(size, horizontal, node.parent))
        return '100%'

    if (stringIsPureNumber(size))
        return parseFloat(size)

    return size
}
