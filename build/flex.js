
// js-flex 1.0.0
// https://github.com/jniac/js-flex#readme
// ES2020 - Build with rollup - 2021/03/28 17:45:12

let count = 0;

const ID = Symbol('Node.ID');

class Node {

    static get ID() { return ID }

    constructor() {

        this[ID] = count++;
        this.root = this;
        this.parent = null;
        this.previous = null;
        this.next = null;
        this.children = [];
    }

    get id() { return this[ID] }

    get isRoot() { return !this.parent }

    get isTip() { return this.children.length === 0 }

    get firstChild() { return this.children[0] }

    get lastChild() { return this.children[this.children.length - 1] }

    get firstTip() {

        let node = this.firstChild;

        while(node.firstChild)
            node = node.firstChild;

        return node
    }

    get lastTip() {

        let node = this.lastChild;

        while(node.lastChild)
            node = node.lastChild;

        return node
    }

    getChild(...indexes) {

        let node = this;

        for (const index of indexes) {

            node = node.children[index];

            if (!node)
                break
        }

        return node
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

            if (this.children.length > 0) {
                node.previous = this.children[this.children.length - 1];
                this.children[this.children.length - 1].next = node;
            }

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
                    node.previous = null;
                    node.next = null;
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

        this.parent?.remove(this);

        return this
    }

    getDepth() {

        let count = 0;

        let scope = this;
        while((scope = scope.parent) !== null)
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

    * parents({ includeSelf = false } = {}) {

        let node = includeSelf ? this : this.parent;

        while (node) {

            yield node;
            node = node.parent;
        }
    }

    parentsArray(options) {

        return [...this.parents(options)]
    }

    * flat({ includeSelf = true, filter = null, progression = 'vertical' } = {}) {

        if ((progression === 'horizontal' || progression === 'vertical') === false)
            throw new Error(`oups "progression" value should be "horizontal" or "vertical" (received ${progression})`)

        const nodes = includeSelf ? [this] : [...this.children];

        while (nodes.length) {

            const node = nodes.shift();

            if (!filter || filter(node))
                yield node;

            if (progression === 'horizontal') {

                nodes.push(...node.children);

            } else if (progression === 'vertical') {

                nodes.unshift(...node.children);
            }
        }
    }

    flatArray(options) {

        return [...this.flat(options)]
    }

    * flatPrune(keepChildrenDelegate, { includeSelf = true, filter = null, progression = 'vertical' } = {}) {

        if ((progression === 'horizontal' || progression === 'vertical') === false)
            throw new Error(`oups "progression" value should be "horizontal" or "vertical" (received ${progression})`)

        const nodes = includeSelf ? [this] : [...this.children];

        while (nodes.length) {

            const node = nodes.shift();

            if (!filter || filter(node))
                yield node;

            if (!keepChildrenDelegate(node))
                continue

            if (progression === 'horizontal') {

                nodes.push(...node.children);

            } else if (progression === 'vertical') {

                nodes.unshift(...node.children);
            }
        }
    }

    flatPruneArray(keepChildrenDelegate, options) {

        return [...this.flatPrune(keepChildrenDelegate, options)]
    }

    query(filter) {

        if (typeof filter === 'number')
            return this.query(node => node[ID] === filter)

        return [...this.flat({ filter })]
    }

    find(test, { includeSelf = true } = {}) {

        if (typeof test === 'number')
            return this.find(node => node[ID] === test, { includeSelf })

        return this.flat({ filter:test }).next().value
    }

    * tips() {

        yield* this.flat({ includeSelf:false, progression:'vertical', filter:node => node.children.length === 0 });
    }

    findUp(test, { includeSelf = true } = {}) {

        let node = includeSelf ? this : this.parent;

        while (node) {

            if (test(node))
                return node

            node = node.parent;
        }
    }



    // toGraphString:
    // ──┬─ "root"
    //   ├─┬─ node
    //   │ └─┬─ node
    //   │   ├─── node
    //   │   └─┬─ node
    //   │     └─── node
    //   ├─── node
    //   ├─┬─ node
    //   │ ├─┬─ node
    //   │ │ └─── node
    //   | └─── node
    //   └─── node

	toGraphStringLine(nodeToString = node => node.toString()) {

        const parentString = this.parentsArray().reverse().map(parent => parent.next ? '│ ' : '  ').join('');
        const selfString = (!this.parent ? (this.next ? '┌' : '─') : (this.next ? '├' : '└')) + '─';
        const childrenString = (this.firstChild ? '┬' : '─') + '─';

		return parentString + selfString + childrenString + ' ' + nodeToString(this)
	}

	toGraphString(nodeToString = node => node.toString()) {

		return this.flatArray()
			.map(node => node.toGraphStringLine(nodeToString))
			.join('\n')
	}

    toString() {

        return `#${this[ID]}`
    }



    // static
    static buildFromObject(object) {

        const stack = [];

        const root = new Node();
        root.name = 'root';
        root.object = object;
        stack.push([root, object]);

        while (stack.length > 0) {

            const [current, object] = stack.shift();

            for (const [key, value] of Object.entries(object)) {

                if (value && typeof value === 'object') {

                    const child = new Node();
                    child.name = key;
                    child.object = value;
                    stack.push([child, value]);

                    current.add(child);
                }
            }
        }

        return root
    }
}

// https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
const overlap = (aMin, aMax, bMin, bMax) => aMin <= bMax && aMax >= bMin;

class Bounds {

    constructor() {

        this.position = 0;
        this.localPosition = 0;
        this.size = 0;
        this.normal = null;
    }

    ensureNormal() {

        if (!this.normal)
            this.normal = new Bounds();

        return this
    }

    getSize2D(horizontal) {

        return horizontal ? this.size : this.normal?.size ?? 0
    }

    get min() { return this.position }
    get max() { return this.position + this.size }

    intersects(other) {

        return overlap(
            this.position,
            this.position + this.size,
            other.position,
            other.position + other.size
        )
    }

    get x() { return this.position }
    get y() { return this.normal?.position ?? 0 }

    get localX() { return this.localPosition }
    get localY() { return this.normal?.localPosition ?? 0 }

    get width() { return this.size }
    get height() { return this.normal?.size ?? 0 }

    get position2D() { return [this.x, this.y] }
    get size2D() { return [this.width, this.height] }
    get rect() { return [this.x, this.y, this.width, this.height] }
}

var Extension2D = Style => {

    Object.assign(Style.prototype, {

        ensureNormal() {

            if (!this.normal)
                this.normal = new Style();

            return this.normal
        },
    });

    Object.defineProperties(Style.prototype, {

        is2D: {

            get() {

                return !!this.normal
            },
        },

        horizontal: {

            get() {

                return this.direction === 'horizontal'
            },

            set(value) {

                this.direction = value ? 'horizontal' : 'vertical';
            },
        },

        vertical: {

            get() {

                return this.direction === 'vertical'
            },

            set(value) {

                this.direction = value ? 'vertical' : 'horizontal';
            },
        },

        normalSize: {

            get() {

                return this.normal?.size ?? 0
            },

            set(value) {

                this.ensureNormal().size = value;
            },
        },

        width: {

            get() {

                return this.size
            },

            set(value) {

                this.size = value;
            },
        },

        height: {

            get() {

                return this.normal?.size
            },

            set(value) {

                this.ensureNormal().size = value;
            },
        },

        paddingLeft: {

            get() {

                return this.paddingStart
            },

            set(value) {

                this.paddingStart = value;
            },
        },

        paddingRight: {

            get() {

                return this.paddingStart
            },

            set(value) {

                this.paddingStart = value;
            },
        },

        paddingTop: {

            get() {

                return this.normal?.paddingStart
            },

            set(value) {

                this.ensureNormal().paddingStart = value;
            },
        },

        paddingBottom: {

            get() {

                return this.normal?.paddingEnd
            },

            set(value) {

                this.ensureNormal().paddingEnd = value;
            },
        },
    });
};

var ExtensionShortHand = Style => {

    Object.defineProperties(Style.prototype, {

        padding: {

            set(value) {

                this.paddingStart =
                this.paddingEnd = value;

                if (this.normal) {

                    this.normal.paddingStart =
                    this.normal.paddingEnd = value;
                }
            },
        },

        spacing: {

            set(value) {

                this.padding = value;
                this.gutter = value;
            },
        },

        sides: {

            set(value) {

                this.width = value;
                this.height = value;
            }
        },

        absoluteOffsetAlign: {

            set(value) {

                this.absoluteAlign =
                this.absoluteOffset = value;
            },
        },
    });
};

const defaultValues = {

    position: 'relative',
    direction: 'horizontal',

    absoluteAlign: 0,
    absoluteOffset: 0,

    // size: 'fit',
    size: '1w',

    gutter: 0,
    paddingStart: 0,
    paddingEnd: 0,

    order: 0,

    // almost identical to https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
    // difference ? "flex-start|end" simplified to "start|end"
    justify: 'center',
    // justify: 'start',
    // justify: 'end',
    // justify: 'space-between',
    // justify: 'space-around',

    alignItems: 'center',
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

        default:
            throw new Error(`oops, invalid value "${string}"`)
    }
};

class Style {

    static get defaultValues() { return defaultValues }

    constructor(props = undefined) {

        if (props)
            this.assign(props);
    }

    assign(props) {

        Object.assign(this, props);

        return this
    }

    resolveAbsoluteOffset(parentBoundsSize) {

        const { absoluteOffset } = this;

        if (typeof absoluteOffset === 'number')
            return absoluteOffset

        return stringToNumber(absoluteOffset) * parentBoundsSize
    }

    resolveAbsoluteAlign(selfBoundsSize) {

        const { absoluteAlign } = this;

        if (typeof absoluteAlign === 'number')
            return absoluteAlign

        return -stringToNumber(absoluteAlign) * selfBoundsSize
    }

    /**
     * returns
     * @return {Array} [freeOffset, extraGutter, extraPaddingStart]
     */
    getJustifyValues(freeSpace, gutterCount, extra) {

        const { justify } = this;

        if (justify.endsWith('%')) {

            return [parseFloat(justify) / 100, 0, 0]
        }

        let freeOffset = 0;
        let extraGutter = 0;
        let extraPaddingStart = 0;

        switch (justify) {

            case 'start':
                freeOffset = 0;
                break

            default:
            case 'center':
                freeOffset = .5;
                break

            case 'end':
                freeOffset = 1;
                break

            case 'space-between':

                if (gutterCount === 0) {

                    freeOffset = .5;

                } else {

                    extraGutter = freeSpace / gutterCount;
                }
                break

            case 'space-evenly':

                if (gutterCount === 0) {

                    freeOffset = .5;

                } else {

                    extraGutter = freeSpace / (gutterCount + 2);
                    extraPaddingStart = extraGutter;
                }
                break

            case 'space-around':

                if (gutterCount === 0) {

                    freeOffset = .5;

                } else {

                    extraGutter = freeSpace / (gutterCount + 1);
                    extraPaddingStart = extraGutter / 2;
                }
                break
        }

        return [freeOffset, extraGutter, extraPaddingStart]
    }
}

Object.assign(Style.prototype, defaultValues);

Extension2D(Style);
ExtensionShortHand(Style);



const keys = [];

for (const key of Object.getOwnPropertyNames(Style.prototype)) {

    if (typeof Style.prototype[key] === 'function')
        continue

    if (key === 'constructor' || key === 'is2D')
        continue

    keys.push(key);
}

Style.keys = Object.freeze(keys);

Style.splitProps = object => {

    const style = {};
    const rest = {};

    for (const [key, value] of Object.entries(object)) {

        if (value === undefined)
            continue

        if (keys.includes(key)) {

            style[key] = value;

        } else {

            rest[key] = value;
        }
    }

    return [style, rest]
};

// handle the special "fill" value
var getNodeStyleSize = node => {

    const { size } = node.style;

    if (size === 'fill')
        return '1w'

    return size
};

var nodeByType = node => {

    // position type
    node.absoluteChildren = [];
    node.nonAbsoluteChildren = [];

    // size type
    node.fixedChildren = [];
    node.relativeChildren = [];
    node.proportionalChildren = [];

    for (const child of node.children) {

        const { position } = child.style;
        const size = getNodeStyleSize(child);

        if (position === 'absolute') {

            node.absoluteChildren.push(child);
            continue
        }

        node.nonAbsoluteChildren.push(child);

        if (typeof size === 'string') {

            if (size.endsWith('w')) {

                child.proportionalWeight = parseFloat(size);
                node.proportionalChildren.push(child);

            } else if (size.endsWith('%') || size === 'fit' || size === 'fill') {

                node.relativeChildren.push(child);

            } else if (/^\d$/.test(size)) {

                node.fixedChildren.push(child);

            } else {

                throw new Error(`Invalid size value: "${size}"`)
            }

        } else if (typeof size === 'number') {

            node.fixedChildren.push(child);

        } else {

            throw new Error(`Invalid size value: "${size}"`)
        }

    }

    node.proportionalSizeReady = node.proportionalChildren.length === 0;
};

const getWhiteSpaceSize = node => {

    const { paddingStart, paddingEnd, gutter } = node.style;
    return paddingStart + paddingEnd + Math.max(node.children.length - 1, 0) * gutter
};

const proportionalSize = node => {

    const relativeChildrenSpace = node.relativeChildren.reduce((total, child) => total + child.bounds.size, 0);
    const fixedChildrenSpace = node.fixedChildren.reduce((total, child) => total + child.bounds.size, 0);
    const freeSpace = node.bounds.size - getWhiteSpaceSize(node) - relativeChildrenSpace - fixedChildrenSpace;

    const totalWeight = node.proportionalChildren.reduce((total, child) => total + child.proportionalWeight, 0);

    for (const child of node.proportionalChildren) {

        child.bounds.size = freeSpace * child.proportionalWeight / totalWeight;
        child.selfSizeReady = true;
    }

    node.proportionalSizeReady = true;
};

var size = node => {

    if (!node.absoluteChildren)
        nodeByType(node);

    if (node.selfSizeReady) {
        // size has been computed, but proportional children are still waiting
        // (node.proportionalSizeReady is false)
        proportionalSize(node);
        return
    }

    const size = getNodeStyleSize(node);

    if (typeof size === 'number') {

        node.bounds.size = size;
        node.selfSizeReady = true;

    } else if (size === 'fit') {

        let space = 0;

        for (const child of node.nonAbsoluteChildren) {

            if (!child.selfSizeReady)
                return

            space += child.bounds.size;
        }

        space += getWhiteSpaceSize(node);

        node.bounds.size = space;
        node.selfSizeReady = true;

    } else if (size.endsWith('%')) {

        if (!node.parent?.selfSizeReady)
            return

        const x = parseFloat(size) / 100;
        const relativeSpace = node.style.position === 'absolute'
            ? node.parent.bounds.size
            : node.parent.bounds.size - getWhiteSpaceSize(node.parent);
        node.bounds.size = relativeSpace * x;
        node.selfSizeReady = true;
    }
};

const stringIsPureNumber = string => /^(\d+(\.\d*)?|\.\d+)$/.test(string);

const sizeIsProportional = size =>
    typeof size === 'string' && size.endsWith('w');

const sizeIsRelative = size =>
    typeof size === 'string' && size.endsWith('%');

const sizeIsOppositeRelative = size =>
    typeof size === 'string' && size.endsWith('op');

// NOTE:
// handling a quite non-sense case:
// size is proportional but the parent is NOT in the same direction, or the parent does not exist (root)
const sizeIsProportionalButDoesNotMakeSense = (size, horizontal, parent) =>
    sizeIsProportional(size) && (!parent || parent.style.horizontal !== horizontal);

var getNodeStyleSize2D = (node, horizontal) => {

    const style = horizontal ? node.style : node.style.normal;
    const { size } = style;

    // handle the special "fill" value
    if (size === 'fill')
        return horizontal === node.parent.style.horizontal ? '1w' : '100%'

    if (sizeIsProportionalButDoesNotMakeSense(size, horizontal, node.parent))
        return '100%'

    if (stringIsPureNumber(size))
        return parseFloat(size)

    return size
};

var nodeByType2D = node => {

    const { horizontal } = node.style;

    // position type
    node.absoluteChildren = [];
    node.nonAbsoluteChildren = [];

    // size type
    node.fixedChildren = [];
    node.relativeChildren = [];
    node.proportionalChildren = [];

    for (const child of node.children) {

        const { position } = child.style;
        const size = getNodeStyleSize2D(child, horizontal);

        if (position === 'absolute') {

            node.absoluteChildren.push(child);
            continue
        }

        node.nonAbsoluteChildren.push(child);

        if (stringIsPureNumber(size)) {

            node.fixedChildren.push(child);

        } else if (typeof size === 'string') {

            if (size.endsWith('w')) {

                child.proportionalWeight = parseFloat(size);
                node.proportionalChildren.push(child);

            } else if (
                sizeIsRelative('%') ||
                sizeIsOppositeRelative('op') ||
                size === 'fit' || size === 'fill') {

                node.relativeChildren.push(child);

            } else {

                throw new Error(`Invalid size value: "${size}"`)
            }

        } else {

            throw new Error(`Invalid size value: ${size} (${typeof size})`)
        }

    }

    node.proportionalSizeReady = node.proportionalChildren.length === 0;
};

const getBounds = (node, horizontal) => horizontal ? node.bounds : node.bounds.normal;

const isDirectionSizeReady = (node, horizontal) => !!node && (horizontal
    ? node.selfHorizontalSizeReady
    : node.selfVerticalSizeReady
);

const getWhiteSpaceSize2D = (node, horizontal) => {

    const { gutter } = node.style;
    const { paddingStart, paddingEnd } = horizontal ? node.style : node.style.normal;

    const gutterSpace =
        node.style.horizontal === horizontal ?
        Math.max(node.children.length - 1, 0) * gutter : 0;

    return paddingStart + paddingEnd + gutterSpace
};

const setBoundsSize = (node, horizontal, value) => {

    if (horizontal) {

        node.bounds.size = value;
        node.selfHorizontalSizeReady = true;

    } else {

        node.bounds.ensureNormal().normal.size = value;
        node.selfVerticalSizeReady = true;
    }

    node.selfSizeReady = node.selfHorizontalSizeReady && node.selfVerticalSizeReady;
};

const proportionalSize$1 = node => {

    const { horizontal } = node.style;

    const relativeChildrenSpace = node.relativeChildren.reduce((total, child) => total + getBounds(child, horizontal).size, 0);
    const fixedChildrenSpace = node.fixedChildren.reduce((total, child) => total + getBounds(child, horizontal).size, 0);
    const freeSpace = getBounds(node, horizontal).size - getWhiteSpaceSize2D(node, horizontal) - relativeChildrenSpace - fixedChildrenSpace;

    const totalWeight = node.proportionalChildren.reduce((total, child) => total + child.proportionalWeight, 0);

    for (const child of node.proportionalChildren) {

        setBoundsSize(child, horizontal, freeSpace * child.proportionalWeight / totalWeight);
    }

    node.proportionalSizeReady = true;
};

// sum of all the non-absolute children
const regularFitSize = (node, horizontal) => {

    let space = 0;

    for (const child of node.nonAbsoluteChildren) {

        if (!isDirectionSizeReady(child, horizontal)) {

            const size = getNodeStyleSize2D(child, horizontal);

            if (sizeIsProportional(size)) {

                // proportional children in the direction (regular) of a "fit" container are non-sense
                // no error, but 0 size will end there
                setBoundsSize(child, horizontal, 0);

            } else {

                return
            }
        }

        space += getBounds(child, horizontal).size;
    }

    space += getWhiteSpaceSize2D(node, horizontal);

    setBoundsSize(node, horizontal, space);
};

// get the biggest child, add whitespace
const oppositeFitSize = (node, horizontal) => {

    let space = 0;

    for (const child of node.nonAbsoluteChildren) {

        if (!isDirectionSizeReady(child, horizontal)) {

            const size = getNodeStyleSize2D(child, horizontal);

            if (sizeIsRelative(size)) {

                continue

            } else {

                return
            }
        }

        space = Math.max(space, getBounds(child, horizontal).size);
    }

    space += getWhiteSpaceSize2D(node, horizontal);

    setBoundsSize(node, horizontal, space);
};

const computeOneSize2D = (node, horizontal) => {

    const size = getNodeStyleSize2D(node, horizontal);

    if (typeof size === 'number') {

        setBoundsSize(node, horizontal, size);

    } else if (size === 'fit') {

        if (node.style.horizontal === horizontal) {

            regularFitSize(node, horizontal);

        } else {

            oppositeFitSize(node, horizontal);
        }

    } else if (sizeIsOppositeRelative(size)) {

        if (!isDirectionSizeReady(node, !horizontal))
            return

        const x = parseFloat(size);
        const relativeSpace = getBounds(node, !horizontal).size;
        setBoundsSize(node, horizontal, relativeSpace * x);

    } else if (sizeIsRelative(size)) {

        if (!isDirectionSizeReady(node.parent, horizontal))
            return

        const x = parseFloat(size) / 100;
        const relativeSpace = node.style.position === 'absolute'
            ? getBounds(node.parent, horizontal).size
            : getBounds(node.parent, horizontal).size - getWhiteSpaceSize2D(node.parent, horizontal);

        setBoundsSize(node, horizontal, relativeSpace * x);
    }
};

var size2D = node => {

    node.bounds.ensureNormal();

    if (!node.absoluteChildren)
        nodeByType2D(node);

    if (isDirectionSizeReady(node, node.style.horizontal)) {

        // size has been computed, but proportional children are still waiting
        // (node.proportionalSizeReady is false)
        if (node.relativeChildren.every(child => isDirectionSizeReady(child, node.style.horizontal)))
            proportionalSize$1(node);
    }

    if (!node.selfHorizontalSizeReady)
        computeOneSize2D(node, true);

    if (!node.selfVerticalSizeReady)
        computeOneSize2D(node, false);
};

const orderSorter = (A, B) => A.style.order < B.style.order ? -1 : 1;

const computeNonAbsoluteChildren = node => {

    const { paddingStart, paddingEnd, gutter } = node.style;

    const gutterCount = Math.max(0, node.nonAbsoluteChildren.length - 1);
    const freeSpace = node.bounds.size
        - paddingStart
        - paddingEnd
        - gutterCount * gutter
        - node.nonAbsoluteChildren.reduce((total, child) => total + child.bounds.size, 0);

    const [freeOffset, extraGutter, extraPaddingStart] = node.style.getJustifyValues(freeSpace, gutterCount);

    let localPosition = paddingStart + extraPaddingStart + freeOffset * freeSpace;

    for (const child of node.nonAbsoluteChildren) {

        child.bounds.localPosition = localPosition;
        child.bounds.position = node.bounds.position + localPosition;

        localPosition += child.bounds.size + gutter + extraGutter;
    }
};

const computeAbsoluteChildren = node => {

    for (const child of node.absoluteChildren) {

        const localPosition =
            child.style.resolveAbsoluteOffset(node.bounds.size) +
            child.style.resolveAbsoluteAlign(child.bounds.size);

        child.bounds.localPosition = localPosition;
        child.bounds.position = node.bounds.position + localPosition;
    }
};

var childrenPosition = node => {

    node.nonAbsoluteChildren.sort(orderSorter);

    computeNonAbsoluteChildren(node);
    computeAbsoluteChildren(node);
};

/**
 * returns
 * @return {Array} [freeOffset, extraGutter, extraPaddingStart]
 */
var getJustifyValues = (justify, freeSpace, gutterCount) => {

    if (justify.endsWith('%')) {

        return [parseFloat(justify) / 100, 0, 0]
    }

    let freeOffset = 0;
    let extraGutter = 0;
    let extraPaddingStart = 0;

    switch (justify) {

        case 'start':
            freeOffset = 0;
            break

        default:
        case 'center':
            freeOffset = .5;
            break

        case 'end':
            freeOffset = 1;
            break

        case 'space-between':

            if (gutterCount === 0) {

                freeOffset = .5;

            } else {

                extraGutter = freeSpace / gutterCount;
            }
            break

        case 'space-evenly':

            if (gutterCount === 0) {

                freeOffset = .5;

            } else {

                extraGutter = freeSpace / (gutterCount + 2);
                extraPaddingStart = extraGutter;
            }
            break

        case 'space-around':

            if (gutterCount === 0) {

                freeOffset = .5;

            } else {

                extraGutter = freeSpace / (gutterCount + 1);
                extraPaddingStart = extraGutter / 2;
            }
            break
    }

    return [freeOffset, extraGutter, extraPaddingStart]
};

const orderSorter$1 = (A, B) => A.style.order < B.style.order ? -1 : 1;

const getBounds$1 = (node, horizontal) => horizontal ? node.bounds : node.bounds.normal;

const computeNonAbsoluteRegularPosition = node => {

    const { justify, gutter, horizontal } = node.style;
    const { paddingStart, paddingEnd } = horizontal ? node.style : node.style.normal;

    const nodeBounds = getBounds$1(node, horizontal);
    const gutterCount = Math.max(0, node.nonAbsoluteChildren.length - 1);
    const freeSpace = nodeBounds.size
        - paddingStart
        - paddingEnd
        - gutterCount * gutter
        - node.nonAbsoluteChildren.reduce((total, child) => total + getBounds$1(child, horizontal).size, 0);

    const [freeOffset, extraGutter, extraPaddingStart] = getJustifyValues(justify, freeSpace, gutterCount);

    let localPosition = paddingStart + extraPaddingStart + freeOffset * freeSpace;

    for (const child of node.nonAbsoluteChildren) {

        const childBounds = getBounds$1(child, horizontal);
        childBounds.localPosition = localPosition;
        childBounds.position = nodeBounds.position + localPosition;

        localPosition += childBounds.size + gutter + extraGutter;
    }
};

const computeNonAbsoluteOppositePosition = node => {

    const { alignItems, horizontal } = node.style;
    const { paddingStart, paddingEnd } = !horizontal ? node.style : node.style.normal;
    const nodeBounds = getBounds$1(node, !horizontal);

    for (const child of node.nonAbsoluteChildren) {

        const freeSpace = nodeBounds.size
            - paddingStart
            - paddingEnd
            - getBounds$1(child, !horizontal).size;

        const { alignSelf } = child.style;

        const [freeOffset, , extraPaddingStart] = getJustifyValues(alignSelf ?? alignItems, freeSpace, 0);

        const localPosition = paddingStart + extraPaddingStart + freeOffset * freeSpace;

        const childBounds = getBounds$1(child, !horizontal);
        childBounds.localPosition = localPosition;
        childBounds.position = nodeBounds.position + localPosition;
    }
};

var childrenPosition2D = node => {

    node.nonAbsoluteChildren.sort(orderSorter$1);

    computeNonAbsoluteRegularPosition(node);
    computeNonAbsoluteOppositePosition(node);
    // computeAbsoluteChildren2D(node)
};

class ComputeNode extends Node {

    constructor(sourceNode, parent) {

        super();

        this.bounds = new Bounds();
        this.style = new Style();

        this.sourceNode = sourceNode;
        this.parent = parent;

        // 'selfSizeReady' vs 'proportionalSizeReady'
        // 'selfSizeReady' is true when bounds.size has been computed
        // 'proportionalSizeReady' can be computed only after that 'selfSizeReady' is true
        this.selfSizeReady = false;
        this.proportionalSizeReady = false;

        // 2D props
        this.selfHorizontalSizeReady = false;
        this.selfVerticalSizeReady = false;

        this.absoluteChildren = null;
        this.nonAbsoluteChildren = null;

        this.fixedChildren = null;
        this.relativeChildren = null;
        this.proportionalChildren = null;

        this.proportionalWeight = NaN;
    }

    computeSizeIsDone() {

        return this.selfSizeReady && this.proportionalSizeReady
    }

    computeSize() {

        size(this);
    }

    computeChildrenPosition() {

        childrenPosition(this);
    }

    computeSize2D() {

        size2D(this);
    }

    computeChildrenPosition2D() {

        childrenPosition2D(this);
    }
}

const getRangeHandler = ({ depthStride = 4, overlapStride = 1 } = {}) => {

    const ranges = new Set();

    const overlapsAnExistingRange = (node, y) => {

        for (const range of ranges)
            if (range.y === y && range.node.bounds.intersects(node.bounds))
                return true

        return false
    };

    const addNode = node => {

        let y = node.depth * depthStride;
        while (overlapsAnExistingRange(node, y))
            y += overlapStride;

        ranges.add({ node, y });

        return y
    };

    return { addNode }
};

const treeToString = (root, { strWidth = 100, strHeight = 20, hMargin = 4 } = {}) => {

    flex.compute(root);

    const array = new Array(strHeight).fill().map(() => new Array(strWidth).fill(' '));

    const handler = getRangeHandler();

    const innerWidth = strWidth - 2 * hMargin;
    const scaleX = innerWidth / root.bounds.size;
 
    for (const node of root.flat()) {

        const name = node.toString();
        const { position:x, size:width } = node.bounds;
        const y = handler.addNode(node);
        const start = hMargin + Math.round(x * scaleX);
        const end = hMargin + Math.round((x + width) * scaleX);
        const chunkWidth = end - start;
        const getChunk = () => {
            if (chunkWidth - 2 >= name.length) {
                const space = chunkWidth - 2 - name.length;
                const left = Math.floor(space / 2);
                const right = space - left;
                return '├' + '─'.repeat(left) + name + '─'.repeat(right) + '┤'
            }
            if (chunkWidth >= 2) {
                return '├' + '─'.repeat(chunkWidth - 2) + '┤'
            }
            return '│'
        };
        const chunk = getChunk();
        for (let i = 0; i < chunkWidth; i++) {
            array[y][start + i] = chunk[i];
        }
    }

    return array.map(a => a.join('')).join('\n')
};

// size iteration is about waiting on nodes depending from other nodes to be computed first
// 3 seems the max iteration real cases can require.
const MAX_SIZE_ITERATION = 8;

const defaultParameters = {

    childrenAccessor: rootSourceNode => rootSourceNode.children ?? [],
    styleAccessor: node => node.style,
    boundsAssignator: (node, bounds) => node.bounds = bounds,
};


const getNow = () => {
    if (typeof performance === 'object') {
        return () => performance.now()
    } else {
        const start = Date.now();
        return () => Date.now() - start
    }
};
const now = getNow();



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

const buildTree = (rootSourceNode, childrenAccessor, styleAccessor) => {

    const rootNode = wrapNode(rootSourceNode, null);

    // rebuild tree
    while (currentNodes.length > 0) {

        const node = currentNodes.shift();
        node.style.assign(styleAccessor(node.sourceNode));

        for (const child of childrenAccessor(node.sourceNode) ?? [])
            node.add(wrapNode(child, node));
    }

    return rootNode
};

const swapNodes = () => {

    currentNodes.length = 0;
    currentNodes.push(...pendingNodes);
    pendingNodes.length = 0;
};

const consoleWarnAboutMaxSizeIteration = rootNode => {

    console.warn(
        `flex computation needs too much iterations (> ${MAX_SIZE_ITERATION})! ` +
        `\n${rootNode.toGraphString(n => pendingNodes.includes(n) ? `%c${n.toString()}%c` : n.toString())}` +
        `\nRemaining pending nodes: %c${pendingNodes.join(', ')}%c`,
        ...new Array(pendingNodes.length + 1).fill(['color: #f21', '']).flat());
};


const compute = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    styleAccessor = defaultParameters.styleAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {

    clearNodes();

    const time = now();

    const rootNode = buildTree(rootSourceNode, childrenAccessor, styleAccessor);



    // resolving size
    let sizeIteration = 0;
    while (sizeIteration < MAX_SIZE_ITERATION && pendingNodes.length > 0) {

        swapNodes();

        for (const node of currentNodes) {

            node.computeSize();

            if (node.computeSizeIsDone() === false)
                pendingNodes.push(node);
        }

        sizeIteration++;
    }

    if (sizeIteration === MAX_SIZE_ITERATION)
        consoleWarnAboutMaxSizeIteration(rootNode);



    // resolving position
    // resolving position (down the tree)
    for (const node of rootNode.flat())
        node.computeChildrenPosition();



    if (verbose) {

        const dt = now() - time;
        const message = `[${dt.toFixed(2)}ms] ${rootNode.totalNodeCount} nodes, size iteration: ${sizeIteration}`;
        typeof verbose === 'function' ? verbose(message) : console.info(message);
    }



    // assigning 'bounds' to 'sourceNode'
    // filling 'nodeMap'
    const nodeMap = new Map();
    for (const node of rootNode.flat()) {
        boundsAssignator(node.sourceNode, node.bounds);
        nodeMap.set(node.sourceNode, node);
    }

    return { nodeMap, rootNode }
};















const compute2D = (rootSourceNode, {

    childrenAccessor = defaultParameters.childrenAccessor,
    styleAccessor = defaultParameters.styleAccessor,
    boundsAssignator = defaultParameters.boundsAssignator,
    verbose = false,

} = {}) => {

    clearNodes();

    const time = now();

    const rootNode = buildTree(rootSourceNode, childrenAccessor, styleAccessor);

    // resolving size
    let sizeIteration = 0;
    while (sizeIteration < MAX_SIZE_ITERATION && pendingNodes.length > 0) {

        swapNodes();

        for (const node of currentNodes) {

            node.computeSize2D();

            if (node.computeSizeIsDone() === false) {
                pendingNodes.push(node);
            }
        }

        sizeIteration++;
    }

    if (sizeIteration === MAX_SIZE_ITERATION)
        consoleWarnAboutMaxSizeIteration(rootNode);



    // resolving position (down the tree)
    for (const node of rootNode.flat())
        node.computeChildrenPosition2D();



    if (verbose) {

        const dt = now() - time;
        const message = `[${dt.toFixed(2)}ms] ${rootNode.totalNodeCount} nodes, size iteration: ${sizeIteration}`;
        typeof verbose === 'function' ? verbose(message) : console.info(message);
    }



    // assigning 'bounds' to 'sourceNode'
    // filling 'nodeMap'
    const nodeMap = new Map();
    for (const node of rootNode.flat()) {
        boundsAssignator(node.sourceNode, node.bounds);
        nodeMap.set(node.sourceNode, node);
    }

    return { nodeMap, rootNode }
};



var flex = {
    now,    
    compute,
    compute2D,
    treeToString,
    Node,
    Style,
    Bounds,
};

export default flex;
