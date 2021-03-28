import flex from '../index.js'

const getRangeHandler = ({ depthStride = 4, overlapStride = 1 } = {}) => {

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

const treeToString = (root, { strWidth = 100, strHeight = 20, hMargin = 4 } = {}) => {

    flex.compute(root)

    const array = new Array(strHeight).fill().map(() => new Array(strWidth).fill(' '))

    const handler = getRangeHandler()

    const innerWidth = strWidth - 2 * hMargin
    const scaleX = innerWidth / root.bounds.size
 
    for (const node of root.flat()) {

        const name = node.toString()
        const { position:x, size:width } = node.bounds
        const y = handler.addNode(node)
        const start = hMargin + Math.round(x * scaleX)
        const end = hMargin + Math.round((x + width) * scaleX)
        const chunkWidth = end - start
        const getChunk = () => {
            if (chunkWidth - 2 >= name.length) {
                const space = chunkWidth - 2 - name.length
                const left = Math.floor(space / 2)
                const right = space - left
                return '├' + '─'.repeat(left) + name + '─'.repeat(right) + '┤'
            }
            if (chunkWidth >= 2) {
                return '├' + '─'.repeat(chunkWidth - 2) + '┤'
            }
            return '│'
        }
        const chunk = getChunk()
        for (let i = 0; i < chunkWidth; i++) {
            array[y][start + i] = chunk[i]
        }
    }

    return array.map(a => a.join('')).join('\n')
}

export default treeToString
