import Layout from './Layout.js'

let count = 0

export default class Node {

    constructor() {

        this.id = count++
        this.root = this
        this.parent = null
        this.previous = null
        this.next = null
        this.children = []
    }

    get isRoot() { return !this.parent }

    get isTip() { return this.children.length === 0 }

    get firstChild() { return this.children[0] }

    get lastChild() { return this.children[this.children.length - 1] }

    get firstTip() {

        let node = this.firstChild

        while(node.firstChild)
            node = node.firstChild

        return node
    }

    get lastTip() {

        let node = this.lastChild

        while(node.lastChild)
            node = node.lastChild

        return node
    }

    contains(child) {

        let node = child

        while (node) {

            if (node === this)
                return true

            node = node.parent
        }

        return false
    }

    isContainedBy(parent) {

        return parent?.contains(this) ?? false
    }

    add(...nodes) {

        for (const node of nodes) {

            if (node.parent)
                node.parent.remove(node)

            if (this.children.length > 0) {
                node.previous = this.children[this.children.length - 1]
                this.children[this.children.length - 1].next = node
            }

            this.children.push(node)
            node.root = this.root
            node.parent = this
        }

        return this
    }

    remove(...nodes) {

        for (const node of nodes) {

            for (let i = this.children.length - 1; i >= 0; i--) {

                if (this.children[i] === node) {

                    node.parent = null
                    node.previous = null
                    node.next = null
                    node.root = node
                    this.children.splice(i, 1)
                }
            }
        }

        return this
    }

    addTo(parent) {

        parent.add(this)

        return this
    }

    removeFromParent() {

        parent?.remove(this)

        return this
    }

    setLayout(layoutProps) {

        this.layout.assign({ layoutProps })

        return this
    }

    getDepth() {

        let count = 0

        let scope = this
        while(scope = scope.parent)
            count++

        return count
    }

    get depth() { return this.getDepth() }

    get totalNodeCount() {

        let count = 1

        for (const node of this.children)
            count += node.totalNodeCount

        return count
    }

    get childIndex () {

        return this.parent?.children.indexOf(this) ?? 0
    }

    * parents() {

        let node = this.parent

        while (node) {

            yield node
            node = node.parent
        }
    }

    * flat({ includeSelf = true, filter = null, progression = 'horizontal' } = {}) {

        if ((progression === 'horizontal' || progression === 'vertical') === false)
            throw new Error(`oups "progression" value should be "horizontal" or "vertical" (received ${progression})`)

        const nodes = includeSelf ? [this] : [...this.children]

        while (nodes.length) {

            const node = nodes.shift()

            if (!filter || filter(node))
                yield node

            if (progression === 'horizontal') {

                nodes.push(...node.children)

            } else if (progression === 'vertical') {

                nodes.unshift(...node.children)
            }
        }
    }

    flatArray(options) {

        return [...this.flat(options)]
    }

    * flatPrune(keepChildrenDelegate, { includeSelf = true, filter = null, progression = 'horizontal' } = {}) {

        if ((progression === 'horizontal' || progression === 'vertical') === false)
            throw new Error(`oups "progression" value should be "horizontal" or "vertical" (received ${progression})`)

        const nodes = includeSelf ? [this] : [...this.children]

        while (nodes.length) {

            const node = nodes.shift()

            if (!filter || filter(node))
                yield node

            if (!keepChildrenDelegate(node))
                continue

            if (progression === 'horizontal') {

                nodes.push(...node.children)

            } else if (progression === 'vertical') {

                nodes.unshift(...node.children)
            }
        }
    }

    flatPruneArray(keepChildrenDelegate, options) {

        return [...this.flatPrune(keepChildrenDelegate, options)]
    }

    query(filter) {

        return [...this.flat({ filter })]
    }

    find(test, { includeSelf = true } = {}) {

        return rootNode.flat({ filter:test }).next().value
    }

    * tips() {

        yield* this.flat({ includeSelf:false, progression:'vertical', filter:node => node.children.length === 0 })
    }

    findUp(test, { includeSelf = true } = {}) {

        let node = includeSelf ? this : this.parent

        while (node) {

            if (test(node))
                return node

            node = node.parent
        }
    }

    // toGraphString:

	toGraphStringLine(nodeToString = node => `#${node.id}`) {

		let intro = []

		for (let parent of this.parents())
			intro.unshift(parent.next ? '│ ' : '  ')

		return intro.join('') +
			(!this.parent ? (this.next ? '┌' : '─') : (this.next ? '├' : '└')) +
			'─' + (this.firstChild ? '┬' : '─') + '─ ' + nodeToString(this)
	}

	toGraphString(nodeToString = node => `#${node.id}`) {

		return this.flatArray({ progression:'vertical' })
			.map(node => node.toGraphStringLine(nodeToString))
			.join('\n')
	}
}
