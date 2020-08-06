export default ({ depthStride = 50, overlapStride = 6 } = {}) => {

    const ranges = new Set()

    const overlapsAnExistingRange = (node, y) => {

        for (const range of ranges)
            if (range.y === y && range.node.bounds.intersects(node.bounds))
                return true

        return false
    }

    const addNode = node => {

        let y = node.depth * depthStride
        while (overlapsAnExistingRange(node, y))
            y += overlapStride

        ranges.add({ node, y })

        return y
    }

    return { addNode }
}
