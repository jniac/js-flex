import { sizeIsProportional } from './utils.js'

// NOTE:
// handling a quite non-sense case:
// size is proportional but the parent is NOT in the same direction, or the parent does not exist (root)
const sizeIsProportionalButDoesNotMakeSense = (size, horizontal, parent) =>
    sizeIsProportional(size) && (!parent || parent.layout.horizontal !== horizontal)

export default (node, horizontal) => {

    const layout = horizontal ? node.layout : node.layout.normal
    const { size } = layout

    // handle the special "fill" value
    if (size === 'fill')
        return horizontal === node.parent.layout.horizontal ? '1w' : '100%'

    if (sizeIsProportionalButDoesNotMakeSense(size, horizontal, node.parent))
        return '100%'

    return size
}
