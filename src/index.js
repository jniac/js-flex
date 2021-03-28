
import Node from './Node.js'
import ComputeNode from './compute/ComputeNode.js'
import Style from './Style/Style.js'
import Bounds from './Bounds.js'
import treeToString from './misc/treeToString.js'
import treeToSvgString from './misc/treeToSvgString.js'

// size iteration is about waiting on nodes depending from other nodes to be computed first
// 3 seems the max iteration real cases can require.
const MAX_SIZE_ITERATION = 8

const defaultParameters = {

    childrenAccessor: rootSourceNode => rootSourceNode.children ?? [],
    styleAccessor: node => node.style,
    boundsAssignator: (node, bounds) => node.bounds = bounds,
}


const getNow = () => {
    if (typeof performance === 'object') {
        return () => performance.now()
    } else {
        const start = Date.now()
        return () => Date.now() - start
    }
}
const now = getNow()



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

const buildTree = (rootSourceNode, childrenAccessor, styleAccessor) => {

    const rootNode = wrapNode(rootSourceNode, null)

    // rebuild tree
    while (currentNodes.length > 0) {

        const node = currentNodes.shift()
        node.style.assign(styleAccessor(node.sourceNode))

        for (const child of childrenAccessor(node.sourceNode) ?? [])
            node.add(wrapNode(child, node))
    }

    return rootNode
}

const swapNodes = () => {

    currentNodes.length = 0
    currentNodes.push(...pendingNodes)
    pendingNodes.length = 0
}

const consoleWarnAboutMaxSizeIteration = rootNode => {

    console.warn(
        `flex computation needs too much iterations (> ${MAX_SIZE_ITERATION})! ` +
        `\n${rootNode.toGraphString(n => pendingNodes.includes(n) ? `%c${n.toString()}%c` : n.toString())}` +
        `\nRemaining pending nodes: %c${pendingNodes.join(', ')}%c`,
        ...new Array(pendingNodes.length + 1).fill(['color: #f21', '']).flat())
}


const compute = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    styleAccessor = defaultParameters.styleAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {

    clearNodes()

    const time = now()

    const rootNode = buildTree(rootSourceNode, childrenAccessor, styleAccessor)



    // resolving size
    let sizeIteration = 0
    while (sizeIteration < MAX_SIZE_ITERATION && pendingNodes.length > 0) {

        swapNodes()

        for (const node of currentNodes) {

            node.computeSize()

            if (node.computeSizeIsDone() === false)
                pendingNodes.push(node)
        }

        sizeIteration++
    }

    if (sizeIteration === MAX_SIZE_ITERATION)
        consoleWarnAboutMaxSizeIteration(rootNode)



    // resolving position
    // resolving position (down the tree)
    for (const node of rootNode.flat())
        node.computeChildrenPosition()



    if (verbose) {

        const dt = now() - time
        const message = `[${dt.toFixed(2)}ms] ${rootNode.totalNodeCount} nodes, size iteration: ${sizeIteration}`
        typeof verbose === 'function' ? verbose(message) : console.info(message)
    }



    // assigning 'bounds' to 'sourceNode'
    // filling 'nodeMap'
    const nodeMap = new Map()
    for (const node of rootNode.flat()) {
        boundsAssignator(node.sourceNode, node.bounds)
        nodeMap.set(node.sourceNode, node)
    }

    return { nodeMap, rootNode }
}















const compute2D = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    styleAccessor = defaultParameters.styleAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {

    clearNodes()

    const time = now()

    const rootNode = buildTree(rootSourceNode, childrenAccessor, styleAccessor)

    // resolving size
    let sizeIteration = 0
    while (sizeIteration < MAX_SIZE_ITERATION && pendingNodes.length > 0) {

        swapNodes()

        for (const node of currentNodes) {

            node.computeSize2D()

            if (node.computeSizeIsDone() === false) {
                pendingNodes.push(node)
            }
        }

        sizeIteration++
    }

    if (sizeIteration === MAX_SIZE_ITERATION)
        consoleWarnAboutMaxSizeIteration(rootNode)



    // resolving position (down the tree)
    for (const node of rootNode.flat())
        node.computeChildrenPosition2D()



    if (verbose) {

        const dt = now() - time
        const message = `[${dt.toFixed(2)}ms] ${rootNode.totalNodeCount} nodes, size iteration: ${sizeIteration}`
        typeof verbose === 'function' ? verbose(message) : console.info(message)
    }



    // assigning 'bounds' to 'sourceNode'
    // filling 'nodeMap'
    const nodeMap = new Map()
    for (const node of rootNode.flat()) {
        boundsAssignator(node.sourceNode, node.bounds)
        nodeMap.set(node.sourceNode, node)
    }

    return { nodeMap, rootNode }
}



export default {
    now,    
    compute,
    compute2D,
    treeToString,
    treeToSvgString,
    Node,
    Style,
    Bounds,
}
