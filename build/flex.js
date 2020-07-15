// js-flex 1.0.0
// ES2020 - Build with rollup - 2020/07/15 22:04:58

const defaultValues = {

    position: 'relative',
    align: 0,
    offset: 0,

    // size: 'fit',
    size: '1w',

    gutter: 0,
    paddingStart: 0,
    paddingEnd: 0,

    order: 0,

    // almost identical to https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
    // difference ? "flex-start|end" simplified to "start|end"
    justifyContent: 'center',
    // justifyContent: 'start',
    // justifyContent: 'end',
    // justifyContent: 'space-between',
    // justifyContent: 'space-around',
};

const stringToNumber = string => {

    if (string.endsWith('%'))
        return parseFloat(string) / 100

    switch (string) {

        case 'start':
        case 'left':
            return 0

        case 'middle':
        case 'center':
            return .5

        case 'end':
        case 'right':
            return 1
    }

    throw new Error(`oups, invalid value "${string}"`)
};

class Layout {

    static get defaultValues() { return defaultValues }

    constructor(props) {

        this.assign(props);
    }

    assign({

        padding,
        offsetAlign,
        ...props

    } = {}) {

        if (padding !== undefined) {

            props.paddingStart =
            props.paddingEnd = padding;
        }

        if (offsetAlign !== undefined) {

            props.align =
            props.offset = offsetAlign;
        }

        Object.assign(this, props);

        return this
    }

    resolveOffset(parentBoundsSize) {

        const { offset } = this;

        if (typeof offset === 'number')
            return offset

        return stringToNumber(offset) * parentBoundsSize
    }

    resolveAlign(selfBoundsSize) {

        const { align } = this;

        if (typeof align === 'number')
            return align

        return -stringToNumber(align) * selfBoundsSize
    }

    /**
     * returns
     * @return {Array} [align, extraGutter, extraPaddingStart]
     */
    getJustifyContentValues(freeSpace, gutterCount, extra) {

        const { justifyContent } = this;

        if (justifyContent.endsWith('%')) {

            return [parseFloat(justifyContent) / 100, 0, 0]
        }

        let align = 0;
        let extraGutter = 0;
        let extraPaddingStart = 0;

        switch (justifyContent) {

            case 'start':
                align = 0;
                break

            default:
            case 'center':
                align = .5;
                break

            case 'end':
                align = 1;
                break

            case 'space-between':

                if (gutterCount === 0) {

                    align = .5;

                } else {

                    extraGutter = freeSpace / gutterCount;
                }
                break

            case 'space-evenly':

                if (gutterCount === 0) {

                    align = .5;

                } else {

                    extraGutter = freeSpace / (gutterCount + 2);
                    extraPaddingStart = extraGutter;
                }
                break

            case 'space-around':

                if (gutterCount === 0) {

                    align = .5;

                } else {

                    extraGutter = freeSpace / (gutterCount + 1);
                    extraPaddingStart = extraGutter / 2;
                }
                break
        }

        return [align, extraGutter, extraPaddingStart]
    }
}

Object.assign(Layout.prototype, defaultValues);

class Node {

    constructor() {

        this.root = this;
        this.parent = null;
        this.children = [];
    }

    get isRoot() { return !this.parent }

    get isTip() { return this.children.length === 0 }

    contains(child) {

        let node = child;

        while (node) {

            if (node === this)
                return true

            node = node.parent;
        }

        return false
    }

    isContainedBy(parent) {

        return parent?.contains(this) ?? false
    }

    add(...nodes) {

        for (const node of nodes) {

            if (node.parent)
                node.parent.remove(node);

            this.children.push(node);
            node.root = this.root;
            node.parent = this;
        }

        return this
    }

    remove(...nodes) {

        for (const node of nodes) {

            for (let i = this.children.length - 1; i >= 0; i--) {

                if (this.children[i] === node) {

                    node.parent = null;
                    node.root = node;
                    this.children.splice(i, 1);
                }
            }
        }

        return this
    }

    addTo(parent) {

        parent.add(this);

        return this
    }

    removeFromParent() {

        parent?.remove(this);

        return this
    }

    setLayout(layoutProps) {

        this.layout.assign({ layoutProps });

        return this
    }

    getDepth() {

        let count = 0;

        let scope = this;
        while(scope = scope.parent)
            count++;

        return count
    }

    get depth() { return this.getDepth() }

    get totalNodeCount() {

        let count = 1;

        for (const node of this.children)
            count += node.totalNodeCount;

        return count
    }

    get childIndex () {

        return this.parent?.children.indexOf(this) ?? 0
    }

    * flat({ includeSelf = true, filter = null, progression = 'horizontal' } = {}) {

        const nodes = includeSelf ? [this] : [...this.children];

        while (nodes.length) {

            const node = nodes.shift();

            if (!filter || filter(node))
                yield node;

            if (progression === 'horizontal') {

                nodes.push(...node.children);

            } else if (progression === 'vertical') {

                nodes.unshift(...node.children);

            } else {

                throw new Error(`oups "progression" value should be "horizontal" or "vertical" (received ${progression})`)
            }
        }
    }

    query(filter) {

        return [...this.flat({ filter })]
    }

    find(test, { includeSelf = true } = {}) {

        return rootNode.flat({ filter:test }).next().value
    }

    * deepestChildren() {

        yield* this.flat({ includeSelf:false, progression:'vertical', filter:node => node.children.length === 0 });
    }

    get deepestChild() {

        return this.deepestChildren().next().value
    }

    findUp(test, { includeSelf = true } = {}) {

        let node = includeSelf ? this : this.parent;

        while (node) {

            if (test(node))
                return node

            node = node.parent;
        }
    }
}

class Bounds {

    constructor() {

        this.position = 0;
        this.size = 0;
    }

    get min() { return this.position }
    get max() { return this.position + this.size }

    intersects(other) {

        // https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
        return this.min <= other.max && this.max >= other.min
    }
}

let count = 0;

const orderSorter = (A, B) => A.layout.order < B.layout.order ? -1 : 1;

class ComputeNode extends Node {

    constructor(sourceNode, parent) {

        super();

        this.id = count++;
        this.bounds = new Bounds();
        this.layout = new Layout();

        this.sourceNode = sourceNode;
        this.parent = parent;

        this.sizeReady = false;

        this.absoluteNodes = null;
        this.nonAbsoluteNodes = null;
        this.relativeNodes = null;
        this.proportionalNodes = null;

        this.proportionalSizeReady = false;
        this.proportionalWeight = NaN;
    }

    getWhiteSpaceSize() {

        const { paddingStart, paddingEnd, gutter } = this.layout;
        return paddingStart + paddingEnd + Math.max(this.children.length - 1, 0) * gutter
    }

    computeNodeByType() {

        this.absoluteNodes = [];
        this.nonAbsoluteNodes = [];
        this.relativeNodes = [];
        this.proportionalNodes = [];

        for (const child of this.children) {

            const { position, size } = child.layout;

            if (position === 'absolute') {

                this.absoluteNodes.push(child);
                continue
            }

            this.nonAbsoluteNodes.push(child);

            if (typeof size === 'string') {

                if (size.endsWith('w')) {

                    child.proportionalWeight = parseFloat(size);
                    this.proportionalNodes.push(child);

                } else if (size.endsWith('%')) {

                    this.relativeNodes.push(child);
                }

            } else {

                this.relativeNodes.push(child);
            }
        }

        this.proportionalSizeReady = this.proportionalNodes.length === 0;
    }

    computeProportionalSize() {

        const relativeNodesSpace = this.relativeNodes.reduce((total, node) => total + node.bounds.size, 0);
        const freeSpace = this.bounds.size - this.getWhiteSpaceSize() - relativeNodesSpace;

        const totalWeight = this.proportionalNodes.reduce((total, node) => total + node.proportionalWeight, 0);

        for (const node of this.proportionalNodes) {

            node.bounds.size = freeSpace * node.proportionalWeight / totalWeight;
            node.sizeReady = true;
        }

        this.proportionalSizeReady = true;
    }

    computeSizeIsDone() {

        return this.sizeReady && this.proportionalSizeReady
    }

    computeSize() {

        if (!this.proportionalNodes)
            this.computeNodeByType();

        if (this.sizeReady) {
            // size has been computed, but proportional children are still waiting
            this.computeProportionalSize();
            return
        }

        const { size } = this.layout;

        if (typeof size === 'number') {

            this.bounds.size = size;
            this.sizeReady = true;

        } else if (size === 'fit') {

            const nodes = this.children.filter(c => c.layout.position !== 'absolute');

            let space = 0;

            for (const node of nodes) {

                if (!node.sizeReady)
                    return

                space += node.bounds.size;
            }

            space += this.getWhiteSpaceSize();

            this.bounds.size = space;
            this.sizeReady = true;

        } else if (size.endsWith('%')) {

            if (!this.parent?.sizeReady)
                return

            const x = parseFloat(size) / 100;
            const relativeSpace = this.layout.position === 'absolute'
                ? this.parent.bounds.size
                : this.parent.bounds.size - this.parent.getWhiteSpaceSize();
            this.bounds.size = relativeSpace * x;
            this.sizeReady = true;
        }
    }

    computeChildrenPosition() {

        {
            // positioning non-absolute nodes

            this.nonAbsoluteNodes.sort(orderSorter);

            const { paddingStart, paddingEnd, gutter } = this.layout;

            const gutterCount = Math.max(0, this.nonAbsoluteNodes.length - 1);
            const freeSpace = this.bounds.size
                - paddingStart
                - paddingEnd
                - gutterCount * gutter
                - this.nonAbsoluteNodes.reduce((total, node) => total + node.bounds.size, 0);

            const [align, extraGutter, extraPaddingStart] = this.layout.getJustifyContentValues(freeSpace, gutterCount);

            let localPosition = paddingStart + extraPaddingStart + align * freeSpace;

            for (const child of this.nonAbsoluteNodes) {

                child.bounds.localPosition = localPosition;
                child.bounds.position = this.bounds.position + localPosition;

                localPosition += child.bounds.size + gutter + extraGutter;
            }
        }

        {
            // positioning absolute nodes

            for (const child of this.absoluteNodes) {

                const localPosition =
                    child.layout.resolveOffset(this.bounds.size) +
                    child.layout.resolveAlign(child.bounds.size);

                child.bounds.localPosition = localPosition;
                child.bounds.position = this.bounds.position + localPosition;
            }
        }
    }
}

const defaultParameters = {

    childrenAccessor: rootSourceNode => rootSourceNode.children ?? [],
    layoutAccessor: node => node.layout,
    boundsAssignator: (node, bounds) => node.bounds = bounds,
};



const now = () => globalThis.performance?.now() ?? Date.now();



// nodes array

const currentNodes = [];
const pendingNodes = [];

const clearNodes = () => {

    currentNodes.length = 0;
    pendingNodes.length = 0;
};

const wrapNode = (sourceNode, parent) => {

    const node = new ComputeNode(sourceNode, parent);
    currentNodes.push(node);
    pendingNodes.push(node);
    return node
};

const buildTree = (rootSourceNode, childrenAccessor, layoutAccessor) => {

    const rootNode = wrapNode(rootSourceNode, null);

    // rebuild tree
    while (currentNodes.length > 0) {

        const node = currentNodes.shift();
        node.layout.assign(layoutAccessor(node.sourceNode));

        for (const child of childrenAccessor(node.sourceNode) ?? [])
            node.children.push(wrapNode(child, node));
    }

    return rootNode
};

const swap = () => {

    currentNodes.push(...pendingNodes);
    pendingNodes.length = 0;
};



const compute = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    layoutAccessor = defaultParameters.layoutAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {

    clearNodes();

    const time = now();

    const rootNode = buildTree(rootSourceNode, childrenAccessor, layoutAccessor);



    // resolving size

    const MAX_ITERATION = 10;

    let sizeCount = 0;

    while (sizeCount < MAX_ITERATION && pendingNodes.length > 0) {

        swap();

        for (const node of currentNodes) {

            node.computeSize();

            if (node.computeSizeIsDone() === false)
                pendingNodes.push(node);
        }

        sizeCount++;
    }

    if (sizeCount > MAX_ITERATION)
        console.warn(`flex computation needs too much iterations! remaining pending nodes:`, pendingNodes);



    // resolving position

    currentNodes.length = 0;
    currentNodes.push(rootNode);

    while (currentNodes.length) {

        const node = currentNodes.shift();

        node.computeChildrenPosition();

        currentNodes.push(...node.children);
    }

    if (verbose) {

        const dt = now() - time;
        const message = `[${dt.toFixed(2)}ms] ${rootNode.totalNodeCount} nodes, size iteration: ${sizeCount}`;
        typeof verbose === 'function' ? verbose(message) : console.info(message);
    }



    // assigning 'bounds' to 'sourceNode'
    // filling 'nodeMap'

    currentNodes.length = 0;
    currentNodes.push(rootNode);

    const nodeMap = new Map();

    while (currentNodes.length) {

        const node = currentNodes.shift();

        boundsAssignator(node.sourceNode, node.bounds);

        currentNodes.push(...node.children);
        nodeMap.set(node.sourceNode, node);
    }

    return { nodeMap, rootNode }
};



const compute2D = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    layoutAccessor = defaultParameters.layoutAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {
};


var index = {
    compute,
    compute2D,
    Node,
    Layout,
    Bounds,
};

export default index;
