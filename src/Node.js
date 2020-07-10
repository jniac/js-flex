import Layout from './Layout.js'

export default class Node {

    constructor() {

        this.root = this
        this.parent = null
        this.children = []
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

    * flat({ includeSelf = true, filter = null } = {}) {

        const nodes = includeSelf ? [this] : [...this.children]

        while (nodes.length) {

            const node = nodes.shift()

            if (!filter || filter(node))
                yield node

            nodes.push(...node.children)
        }

        return this
    }

    query(filter) {

        return [...this.flat({ filter })]
    }
}
