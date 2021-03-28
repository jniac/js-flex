import flex from '../index.js'
import { getRangeHandler } from './getRangeHandler.js'

const treeToSvgString = (root, { width = 500, height = 250, margin = 4 } = {}) => {

    flex.compute(root)

    const nodeHeight = 10
    const handler = getRangeHandler({ depthStride:nodeHeight * 4, overlapStride:nodeHeight })
    const innerWidth = width - 2 * margin
    const scaleX = innerWidth / root.bounds.size
    const tab = x => '    '.repeat(x)

    const children = []
    const add = str => children.push(tab(1) + str)
    for (const node of root.flat()) {

        const { position:nodeX, size:nodeWidth } = node.bounds
        const color = node.findUp(n => n.style?.color)?.style.color ?? 'black'
        const x1 = margin + scaleX * (nodeX)
        const x2 = margin + scaleX * (nodeX + nodeWidth)
        const y = margin + handler.addNode(node)
        const info = node.toString()
        add(`<text fill=${color} x=${(x1 + x2) / 2} y=${y - nodeHeight / 2} dominant-baseline="middle" text-anchor="middle">${info}</text>`)
        add(`<line stroke=${color} x1=${x1} y1=${y - nodeHeight / 2} x2=${x1} y2=${y + nodeHeight / 2}></line>`)
        add(`<line stroke=${color} x1=${x2} y1=${y - nodeHeight / 2} x2=${x2} y2=${y + nodeHeight / 2}></line>`)
        add(`<line stroke=${color} x1=${x1} y1=${y} x2=${x2} y2=${y}></line>`)
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