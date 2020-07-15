
import Node from './Node.js'
import ComputeNode from './ComputeNode.js'
import Layout from './Layout.js'
import Bounds from './Bounds.js'

const defaultParameters = {

    childrenAccessor: rootSourceNode => rootSourceNode.children ?? [],
    layoutAccessor: node => node.layout,
    boundsAssignator: (node, bounds) => node.bounds = bounds,
}



const now = () => globalThis.performance?.now() ?? Date.now()

const currentNodes = []
const pendingNodes = []

const swap = () => {

    currentNodes.push(...pendingNodes)
    pendingNodes.length = 0
}

const compute = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    layoutAccessor = defaultParameters.layoutAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {

    currentNodes.length = 0
    pendingNodes.length = 0

    const time = now()

    const nodeMap = new Map()

    const wrap = (sourceNode, parent) => {

        const node = new ComputeNode(sourceNode, parent)
        currentNodes.push(node)
        pendingNodes.push(node)
        nodeMap.set(sourceNode, node)
        return node
    }

    const rootNode = wrap(rootSourceNode, null)

    // rebuild tree
    while (currentNodes.length > 0) {

        const node = currentNodes.shift()
        node.layout.assign(layoutAccessor(node.sourceNode))

        for (const child of childrenAccessor(node.sourceNode) ?? [])
            node.children.push(wrap(child, node))
    }



    // resolving size

    const MAX_ITERATION = 10

    let sizeCount = 0

    while (sizeCount < MAX_ITERATION && pendingNodes.length > 0) {

        swap()

        for (const node of currentNodes) {

            node.computeSize()

            if (node.computeSizeIsDone() === false)
                pendingNodes.push(node)
        }

        sizeCount++
    }

    if (sizeCount > MAX_ITERATION)
        console.warn(`flex computation needs too much iterations! remaining pending nodes:`, pendingNodes)



    // resolving position

    currentNodes.length = 0
    currentNodes.push(rootNode)

    while (currentNodes.length) {

        const node = currentNodes.shift()

        node.computeChildrenPosition()

        currentNodes.push(...node.children)
    }

    if (verbose) {

        const dt = now() - time
        const message = `[${dt.toFixed(2)}ms] ${rootNode.totalNodeCount} nodes, size iteration: ${sizeCount}`
        typeof verbose === 'function' ? verbose(message) : console.info(message)
    }



    // assigning bounds to sourceNode

    currentNodes.length = 0
    currentNodes.push(rootNode)

    while (currentNodes.length) {

        const node = currentNodes.shift()

        boundsAssignator(node.sourceNode, node.bounds)

        currentNodes.push(...node.children)
    }

    return { nodeMap, rootNode }
}

export default {
    compute,
    Node,
    Layout,
    Bounds,
}
