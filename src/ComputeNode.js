import Node from './Node.js'
import Bounds from './Bounds.js'
import Layout from './Layout.js'

let count = 0

const orderSorter = (A, B) => A.layout.order < B.layout.order ? -1 : 1

export default class ComputeNode extends Node {

    constructor(sourceNode, parent) {

        super()

        this.id = count++
        this.bounds = new Bounds()
        this.layout = new Layout()

        this.sourceNode = sourceNode
        this.parent = parent

        this.sizeReady = false

        this.absoluteNodes = null
        this.nonAbsoluteNodes = null
        this.relativeNodes = null
        this.proportionalNodes = null

        this.proportionalSizeReady = false
        this.proportionalWeight = NaN
    }

    getWhiteSpaceSize() {

        const { paddingStart, paddingEnd, gutter } = this.layout
        return paddingStart + paddingEnd + Math.max(this.children.length - 1, 0) * gutter
    }

    computeNodeByType() {

        this.absoluteNodes = []
        this.nonAbsoluteNodes = []
        this.relativeNodes = []
        this.proportionalNodes = []

        for (const child of this.children) {

            const { position, size } = child.layout

            if (position === 'absolute') {

                this.absoluteNodes.push(child)
                continue
            }

            this.nonAbsoluteNodes.push(child)

            if (typeof size === 'string') {

                if (size.endsWith('w')) {

                    child.proportionalWeight = parseFloat(size)
                    this.proportionalNodes.push(child)

                } else if (size.endsWith('%')) {

                    this.relativeNodes.push(child)
                }

            } else {

                this.relativeNodes.push(child)
            }
        }

        this.proportionalSizeReady = this.proportionalNodes.length === 0
    }

    computeProportionalSize() {

        const relativeNodesSpace = this.relativeNodes.reduce((total, node) => total + node.bounds.size, 0)
        const freeSpace = this.bounds.size - this.getWhiteSpaceSize() - relativeNodesSpace

        const totalWeight = this.proportionalNodes.reduce((total, node) => total + node.proportionalWeight, 0)

        for (const node of this.proportionalNodes) {

            node.bounds.size = freeSpace * node.proportionalWeight / totalWeight
            node.sizeReady = true
        }

        this.proportionalSizeReady = true
    }

    computeSizeIsDone() {

        return this.sizeReady && this.proportionalSizeReady
    }

    computeSize() {

        if (!this.proportionalNodes)
            this.computeNodeByType()

        if (this.sizeReady) {
            // size has been computed, but proportional children are still waiting
            this.computeProportionalSize()
            return
        }

        const { size } = this.layout

        if (typeof size === 'number') {

            this.bounds.size = size
            this.sizeReady = true

        } else if (size === 'fit') {

            const nodes = this.children.filter(c => c.layout.position !== 'absolute')

            let space = 0

            for (const node of nodes) {

                if (!node.sizeReady)
                    return

                space += node.bounds.size
            }

            space += this.getWhiteSpaceSize()

            this.bounds.size = space
            this.sizeReady = true

        } else if (size.endsWith('%')) {

            if (!this.parent?.sizeReady)
                return

            const x = parseFloat(size) / 100
            const relativeSpace = this.layout.position === 'absolute'
                ? this.parent.bounds.size
                : this.parent.bounds.size - this.parent.getWhiteSpaceSize()
            this.bounds.size = relativeSpace * x
            this.sizeReady = true
        }
    }

    computeChildrenPosition() {

        {
            // positioning non-absolute nodes

            this.nonAbsoluteNodes.sort(orderSorter)

            const { paddingStart, paddingEnd, gutter } = this.layout

            const gutterCount = Math.max(0, this.nonAbsoluteNodes.length - 1)
            const freeSpace = this.bounds.size
                - paddingStart
                - paddingEnd
                - gutterCount * gutter
                - this.nonAbsoluteNodes.reduce((total, node) => total + node.bounds.size, 0)

            const [align, extraGutter, extraPaddingStart] = this.layout.getJustifyContentValues(freeSpace, gutterCount)

            let localPosition = paddingStart + extraPaddingStart + align * freeSpace

            for (const child of this.nonAbsoluteNodes) {

                child.bounds.localPosition = localPosition
                child.bounds.position = this.bounds.position + localPosition

                localPosition += child.bounds.size + gutter + extraGutter
            }
        }

        {
            // positioning absolute nodes

            for (const child of this.absoluteNodes) {

                const localPosition =
                    child.layout.resolveOffset(this.bounds.size) +
                    child.layout.resolveAlign(child.bounds.size)

                child.bounds.localPosition = localPosition
                child.bounds.position = this.bounds.position + localPosition
            }
        }
    }
}
