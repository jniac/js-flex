// js-flex
// ES2020 - Build with rollup - 2020/07/10 16:44:47

const defaultValues = {

    position: 'relative',
    offset: 0,

    // size: 'fit',
    size: 10,

    gutter: 10,
    paddingStart: 20,
    paddingEnd: 20,

    order: 0,

    // almost identical to https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
    // difference ? "flex-start|end" simplified to "start|end"
    justifyContent: 'center',
    // justifyContent: 'start',
    // justifyContent: 'end',
    // justifyContent: 'space-between',
    // justifyContent: 'space-around',
};

class Layout {

    static get defaultValues() { return defaultValues }

    constructor(props) {

        this.assign(props);
    }

    assign({ padding, ...props } = {}) {

        if (padding !== undefined) {

            props.paddingStart =
            props.paddingEnd = padding;
        }

        Object.assign(this, props);

        return this
    }

    /**
     * returns
     * @return {Array} [align, extraGutter]
     */
    getJustifyContentValues(freeSpace, gutterCount) {

        const { justifyContent } = this;

        if (justifyContent.endsWith('%')) {

            return [parseFloat(justifyContent) / 100, 0]
        }

        switch (justifyContent) {

            case 'start':
                return [0, 0]

            default:
            case 'center':
                return [.5, 0]

            case 'end':
                return [1, 0]

            case 'space-between':
                return gutterCount === 0 ? [.5, 0] : [0, freeSpace / gutterCount]

            case 'space-around':
                throw new Error(`justifyContent "${justifyContent}" value not implemented!`)
        }
    }
}

Object.assign(Layout.prototype, defaultValues);

class Node {

    constructor() {

        this.root = this;
        this.parent = null;
        this.children = [];
    }

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

    * flat({ includeSelf = true, filter = null } = {}) {

        const nodes = includeSelf ? [this] : [...this.children];

        while (nodes.length) {

            const node = nodes.shift();

            if (!filter || filter(node))
                yield node;

            nodes.push(...node.children);
        }

        return this
    }

    query(filter) {

        return [...this.flat({ filter })]
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

    constructor(originalNode, parent) {

        super();

        this.id = count++;
        this.bounds = new Bounds();
        this.layout = new Layout();

        this.originalNode = originalNode;
        this.parent = parent;

        this.sizeReady = false;

        this.proportionalNodes = null;
        this.proportionalSizeReady = false;
        this.proportionalWeight = NaN;
    }

    getWhiteSpaceSize() {

        const { paddingStart, paddingEnd, gutter } = this.layout;
        return paddingStart + paddingEnd + Math.max(this.children.length - 1, 0) * gutter
    }

    computeNodeByType() {

        this.proportionalNodes = [];
        this.relativeNodes = [];

        for (const child of this.children) {

            const { position, size } = child.layout;

            if (position === 'absolute')
                continue

            if (typeof size === 'string') {

                if (size.endsWith('w')) {

                    child.proportionalWeight = parseFloat(size);
                    this.proportionalNodes.push(child);

                } else if (size.endsWith('%')) {

                    this.relativeNodes.push(child);
                }
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

        const children = this.children
        .filter(node => node.layout.position !== 'absolute')
        .sort(orderSorter);

        const { paddingStart, paddingEnd, gutter } = this.layout;

        const gutterCount = Math.max(0, children.length - 1);
        const freeSpace = this.bounds.size
            - paddingStart
            - paddingEnd
            - gutterCount * gutter
            - children.reduce((total, node) => total + node.bounds.size, 0);

        const [align, extraGutter] = this.layout.getJustifyContentValues(freeSpace, gutterCount);

        let position = this.bounds.position + paddingStart + freeSpace * align;

        for (const child of children) {

            child.bounds.position = position;

            position += child.bounds.size + gutter + extraGutter;
        }
    }
}

const defaultParameters = {

    childrenAccessor: root => root.children ?? [],
    layoutAccessor: node => node.layout,
    boundsAssignator: (bounds, node) => node.bounds = bounds,
};



const now = () => globalThis.performance?.now() ?? Date.now();

const currentNodes = [];
const pendingNodes = [];

const swap = () => {

    currentNodes.push(...pendingNodes);
    pendingNodes.length = 0;
};

const compute = (root, {

    childrenAccessor = defaultParameters.childrenAccessor,
    layoutAccessor = defaultParameters.layoutAccessor,
    verbose = false,

} = {}) => {

    currentNodes.length = 0;
    pendingNodes.length = 0;

    const time = now();

    const nodeMap = new Map();

    const wrap = (originalNode, parent) => {

        const node = new ComputeNode(originalNode, parent);
        currentNodes.push(node);
        pendingNodes.push(node);
        nodeMap.set(originalNode, node);
        return node
    };

    const rootNode = wrap(root, null);

    // rebuild tree
    while (currentNodes.length > 0) {

        const node = currentNodes.shift();
        node.layout.assign(layoutAccessor(node.originalNode));

        for (const child of childrenAccessor(node.originalNode) ?? [])
            node.children.push(wrap(child, node));
    }


    const MAX_ITERATION = 10;

    // resolving size
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
        console.info(`[${dt.toFixed(2)}ms] ${rootNode.totalNodeCount} nodes, size iteration: ${sizeCount}`);
    }

    return { nodeMap, rootNode }
};

var index = {
    compute,
    Node,
    Layout,
    Bounds,
};

export default index;
