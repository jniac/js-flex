
import Node from './Node.js'
import ComputeNode from './ComputeNode.js'
import Layout from './Layout.js'
import Bounds from './Bounds.js'

// size iteration is about waiting on nodes depending from other nodes to be computed first
// 3 seems the max iteration real cases can require.
const MAX_SIZE_ITERATION = 10

const defaultParameters = {

    childrenAccessor: rootSourceNode => rootSourceNode.children ?? [],
    layoutAccessor: node => node.layout,
    boundsAssignator: (node, bounds) => node.bounds = bounds,
}



const now = () => globalThis.performance?.now() ?? Date.now()



// nodes array

const currentNodes = []
const pendingNodes = []

const clearNodes = () => {

    currentNodes.length = 0
    pendingNodes.length = 0
}

const wrapNode = (sourceNode, parent) => {

    const node = new ComputeNode(sourceNode, parent)
    currentNodes.push(node)
    pendingNodes.push(node)
    return node
}

const buildTree = (rootSourceNode, childrenAccessor, layoutAccessor) => {

    const rootNode = wrapNode(rootSourceNode, null)

    // rebuild tree
    while (currentNodes.length > 0) {

        const node = currentNodes.shift()
        node.layout.assign(layoutAccessor(node.sourceNode))

        for (const child of childrenAccessor(node.sourceNode) ?? [])
            node.children.push(wrapNode(child, node))
    }

    return rootNode
}

const swapNodes = () => {

    currentNodes.push(...pendingNodes)
    pendingNodes.length = 0
}



const compute = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    layoutAccessor = defaultParameters.layoutAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {

    clearNodes()

    const time = now()

    const rootNode = buildTree(rootSourceNode, childrenAccessor, layoutAccessor)



    // resolving size

    let sizeCount = 0

    while (sizeCount < MAX_SIZE_ITERATION && pendingNodes.length > 0) {

        swapNodes()

        for (const node of currentNodes) {

            node.computeSize()

            if (node.computeSizeIsDone() === false)
                pendingNodes.push(node)
        }

        sizeCount++
    }

    if (sizeCount > MAX_SIZE_ITERATION)
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



    // assigning 'bounds' to 'sourceNode'
    // filling 'nodeMap'

    currentNodes.length = 0
    currentNodes.push(rootNode)

    const nodeMap = new Map()

    while (currentNodes.length) {

        const node = currentNodes.shift()

        boundsAssignator(node.sourceNode, node.bounds)

        currentNodes.push(...node.children)
        nodeMap.set(node.sourceNode, node)
    }

    return { nodeMap, rootNode }
}



const compute2D = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    layoutAccessor = defaultParameters.layoutAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {

    clearNodes()

    const time = now()

    const rootNode = buildTree(rootSourceNode, childrenAccessor, layoutAccessor)



    const horizontalRootNodes = []
    const verticalRootNodes = []

    clearNodes()
    currentNodes.push(rootNode)

    while (currentNodes.length) {

        const node = currentNodes.shift()

        currentNodes.push(...node.children)
    }

    // TODO: hey! do the job plz!
    throw new Error(`compute2D() is not implemented!`)
}



export default {
    compute,
    compute2D,
    Node,
    Layout,
    Bounds,
}
