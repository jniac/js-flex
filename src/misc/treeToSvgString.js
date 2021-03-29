import { checkRoot, getRangeHandler } from './utils.js'

const mix = (a, b, t) => a * (1 - t) + b * t

/**
 * Draw the tree as an SVG string.
 * @param {Node} root 
 * @param {*} options 
 * @returns 
 */
const treeToSvgString = (root, { width = 500, height = 250, margin = 20, showHierarchy = true } = {}) => {

    checkRoot(root)

    const nodeHeight = 10
    const handler = getRangeHandler({ depthStride:nodeHeight * 4, overlapStride:nodeHeight })
    const innerWidth = width - 2 * margin
    const scaleX = innerWidth / root.bounds.size
    const tab = x => '    '.repeat(x)
    const fmt = x => x.toFixed(1)

    const children = []
    const add = str => children.push(tab(1) + str)
    const prepend = str => children.unshift(tab(1) + str)
    for (const node of root.flat()) {

        const { position:nodeX, size:nodeWidth } = node.bounds
        const color = node.findUp(n => n.style?.color)?.style.color ?? 'black'
        const x1 = margin + scaleX * (nodeX)
        const x2 = margin + scaleX * (nodeX + nodeWidth)
        const xi = (x1 + x2) / 2
        const y = margin + handler.addNode(node)
        let info = node.toString()
        if (node.style?.svgShowRange) {
            info += ` [${fmt(nodeX)},${fmt(nodeX + nodeWidth)}]`
        }
        if (node.style?.svgShowSize) {
            info += ` (${fmt(nodeWidth)})`
        }
        add(`<text fill="${color}" x="${xi}" y="${y - nodeHeight / 2}" dominant-baseline="middle" text-anchor="middle">${info}</text>`)
        add(`<line stroke="${color}" x1="${x1}" y1="${y - nodeHeight / 2}" x2="${x1}" y2="${y + nodeHeight / 2}"></line>`)
        add(`<line stroke="${color}" x1="${x2}" y1="${y - nodeHeight / 2}" x2="${x2}" y2="${y + nodeHeight / 2}"></line>`)
        add(`<line stroke="${color}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"></line>`)
        
        if (showHierarchy && node.parent) {
            const { position:px, size:pw } = node.parent.bounds
            const color = node.parent.findUp(n => n.style?.color)?.style.color ?? 'black'
            const x1 = xi
            const y1 = y - nodeHeight - 2
            const x2 = margin + scaleX * (px + pw / 2)
            const y2 = margin + handler.getNodeY(node.parent)
            const t = .4
            const d = `M ${x1},${y1} C ${x1},${mix(y1,y2,t)} ${x2},${mix(y2,y1,t)} ${x2},${y2}`
            prepend(`<path stroke="${color}" d="${d}" fill="none" opacity=".25"></path>`)
        }
    }

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
        text { 
            font-family: 'Roboto Mono', monospace; 
            font-size: 10px;
            font-weight: 400;
        }
    </style>
${children.join('\n')}
</svg>
`
}

export default treeToSvgString