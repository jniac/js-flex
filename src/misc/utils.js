/**
 * Checks if root is a Node instance, and has computed bounds.
 * @param {Node} root 
 */
export const checkRoot = (root) => {

    if (root.flat === undefined) {
        throw new Error(`root is not an Node!`)
    }
    if (root.bounds === undefined) {
        throw new Error(`root has no Bounds! (missing flex.compute(root)?)`)
    }
}



/**
 * Returns an handler to handle range overlaps (y offset if so).
 * @param {{ depthStride:number, overlapStride:number }} strides Y offset (stride). 
 * @returns 
 */
export const getRangeHandler = ({ depthStride = 4, overlapStride = 1 } = {}) => {

    /** @type {Set<{ node:Node, y:number }>} */
    const ranges = new Set()

    const overlapsAnExistingRange = (node, y) => {

        for (const range of ranges)
            if (range.y === y && range.node.bounds.intersects(node.bounds))
                return true

        return false
    }

    /**
     * Add a node to the range handler (handling overlaps).
     * @param {Node} node The node to handle.
     * @returns {number} The vertical position of the node.
     */
    const addNode = node => {

        let y = node.depth * depthStride
        while (overlapsAnExistingRange(node, y))
            y += overlapStride

        ranges.add({ node, y })

        return y
    }

    return { addNode }
}
