import { getRangeHandler } from './utils.js'

const treeToString = (root, { width = 100, height = 20, hMargin = 4 } = {}) => {

    checkRoot(root)

    const array = new Array(height).fill().map(() => new Array(width).fill(' '))

    const handler = getRangeHandler()

    const innerWidth = width - 2 * hMargin
    const scaleX = innerWidth / root.bounds.size
 
    for (const node of root.flat()) {

        const name = node.toString()
        const { position:nodeX, size:nodeWidth } = node.bounds
        const y = handler.addNode(node)
        const start = hMargin + Math.round(nodeX * scaleX)
        const end = hMargin + Math.round((nodeX + nodeWidth) * scaleX)
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
            const x = start + i
            const out = x < 0 || x >= width || y < 0 || y >= height
            if (out) {
                continue
            }
            array[y][x] = chunk[i]
        }
    }

    return array.map(a => a.join('')).join('\n')
}

export default treeToString
