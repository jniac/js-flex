import getRangeHandler from './getRangeHandler.js'

export default ({ flex, root, display, showText = true, depthStride = 50 }) => {

    const { rootNode } = flex.compute(root)
    display.addToScope({ rootNode })

    const handler = getRangeHandler({ depthStride })

    display.clear()

    for (const node of root.flat()) {

        const color = node.findUp(n => n.style?.color)?.style.color ?? display.defaultColor
        const y = handler.addNode(node)
        const { position:x, size:width } = node.bounds

        const text = showText && node.toString()
        display.drawRange(x, y, width, { text, color })
    }
}
