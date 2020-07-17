import Node from './Node.js'
import Bounds from './Bounds.js'
import Layout from './Layout/Layout.js'

const orderSorter = (A, B) => A.layout.order < B.layout.order ? -1 : 1

export default class ComputeNode extends Node {

    constructor(sourceNode, parent) {

        super()

        this.bounds = new Bounds()
        this.layout = new Layout()

        this.sourceNode = sourceNode
        this.parent = parent

        // 'selfSizeReady' vs 'proportionalSizeReady'
        // 'selfSizeReady' is true when bounds.size has been computed
        // 'proportionalSizeReady' can be computed only after that 'selfSizeReady' is true
        this.selfSizeReady = false
        this.proportionalSizeReady = false

        this.absoluteChildren = null
        this.nonAbsoluteChildren = null

        this.fixedChildren = null
        this.relativeChildren = null
        this.proportionalChildren = null

        this.proportionalWeight = NaN
    }

    getWhiteSpaceSize() {

        const { paddingStart, paddingEnd, gutter } = this.layout
        return paddingStart + paddingEnd + Math.max(this.children.length - 1, 0) * gutter
    }

    computeNodeByType() {

        // position type
        this.absoluteChildren = []
        this.nonAbsoluteChildren = []

        // size type
        this.fixedChildren = []
        this.relativeChildren = []
        this.proportionalChildren = []

        for (const child of this.children) {

            const { position, size } = child.layout

            if (position === 'absolute') {

                this.absoluteChildren.push(child)
                continue
            }

            this.nonAbsoluteChildren.push(child)

            if (typeof size === 'string') {

                if (size.endsWith('w')) {

                    child.proportionalWeight = parseFloat(size)
                    this.proportionalChildren.push(child)

                } else if (size.endsWith('%') || size === 'fit') {

                    this.relativeChildren.push(child)

                } else if (/^\d$/.test(size)) {

                    this.fixedChildren.push(child)

                } else {

                    throw new Error(`Invalid size value: "${size}"`)
                }

            } else if (typeof size === 'number') {

                this.fixedChildren.push(child)

            } else {

                throw new Error(`Invalid size value: "${size}"`)
            }

        }

        this.proportionalSizeReady = this.proportionalChildren.length === 0
    }

    computeProportionalSize() {

        const relativeChildrenSpace = this.relativeChildren.reduce((total, child) => total + child.bounds.size, 0)
        const fixedChildrenSpace = this.fixedChildren.reduce((total, child) => total + child.bounds.size, 0)
        const freeSpace = this.bounds.size - this.getWhiteSpaceSize() - relativeChildrenSpace - fixedChildrenSpace

        const totalWeight = this.proportionalChildren.reduce((total, child) => total + child.proportionalWeight, 0)

        for (const child of this.proportionalChildren) {

            child.bounds.size = freeSpace * child.proportionalWeight / totalWeight
            child.selfSizeReady = true
        }

        this.proportionalSizeReady = true
    }

    computeSizeIsDone() {

        return this.selfSizeReady && this.proportionalSizeReady
    }

    computeSize() {

        if (!this.absoluteChildren)
            this.computeNodeByType()

        if (this.selfSizeReady) {
            // size has been computed, but proportional children are still waiting
            this.computeProportionalSize()
            return
        }

        const { size } = this.layout

        if (typeof size === 'number') {

            this.bounds.size = size
            this.selfSizeReady = true

        } else if (size === 'fit') {

            let space = 0

            for (const child of this.nonAbsoluteChildren) {

                if (!child.selfSizeReady)
                    return

                space += child.bounds.size
            }

            space += this.getWhiteSpaceSize()

            this.bounds.size = space
            this.selfSizeReady = true

        } else if (size.endsWith('%')) {

            if (!this.parent?.selfSizeReady)
                return

            const x = parseFloat(size) / 100
            const relativeSpace = this.layout.position === 'absolute'
                ? this.parent.bounds.size
                : this.parent.bounds.size - this.parent.getWhiteSpaceSize()
            this.bounds.size = relativeSpace * x
            this.selfSizeReady = true
        }
    }

    computeChildrenPosition() {

        {
            // positioning non-absolute children

            this.nonAbsoluteChildren.sort(orderSorter)

            const { paddingStart, paddingEnd, gutter } = this.layout

            const gutterCount = Math.max(0, this.nonAbsoluteChildren.length - 1)
            const freeSpace = this.bounds.size
                - paddingStart
                - paddingEnd
                - gutterCount * gutter
                - this.nonAbsoluteChildren.reduce((total, child) => total + child.bounds.size, 0)

            const [align, extraGutter, extraPaddingStart] = this.layout.getJustifyContentValues(freeSpace, gutterCount)

            let localPosition = paddingStart + extraPaddingStart + align * freeSpace

            for (const child of this.nonAbsoluteChildren) {

                child.bounds.localPosition = localPosition
                child.bounds.position = this.bounds.position + localPosition

                localPosition += child.bounds.size + gutter + extraGutter
            }
        }

        {
            // positioning absolute children

            for (const child of this.absoluteChildren) {

                const localPosition =
                    child.layout.resolveOffset(this.bounds.size) +
                    child.layout.resolveAlign(child.bounds.size)

                child.bounds.localPosition = localPosition
                child.bounds.position = this.bounds.position + localPosition
            }
        }
    }
}
