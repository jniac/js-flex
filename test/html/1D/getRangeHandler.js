export default ({ depthStride = 50 } = {}) => {

    const ranges = new Set()

    const collidesWithAnExistingRange = (node, y) => {

        for (const range of ranges)
            if (range.y === y && range.node.bounds.intersects(node.bounds))
                return true

        return false
    }

    const addNode = node => {

        let y = node.depth * depthStride
        while (collidesWithAnExistingRange(node, y))
            y += 3

        ranges.add({ node, y })

        return y
    }

    return { addNode }
}
