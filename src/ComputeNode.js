import Node from './Node.js'
import Bounds from './Bounds.js'
import Layout from './Layout/Layout.js'

import {
    getWhiteSpaceSize,
    getWhiteSpaceSize2D,
    computeSize2D,
} from './computeFunctions.js'

import computeChildrenPosition from './computeChildrenPosition.js'
import computeChildrenPosition2D from './computeChildrenPosition2D.js'

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
        const freeSpace = this.bounds.size - getWhiteSpaceSize(this) - relativeChildrenSpace - fixedChildrenSpace

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
            // (this.proportionalSizeReady is false)
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

            space += getWhiteSpaceSize(this)

            this.bounds.size = space
            this.selfSizeReady = true

        } else if (size.endsWith('%')) {

            if (!this.parent?.selfSizeReady)
                return

            const x = parseFloat(size) / 100
            const relativeSpace = this.layout.position === 'absolute'
                ? this.parent.bounds.size
                : this.parent.bounds.size - getWhiteSpaceSize(this.parent)
            this.bounds.size = relativeSpace * x
            this.selfSizeReady = true
        }
    }
    
    computeChildrenPosition() {

        computeChildrenPosition(this)
    }

    computeSize2D() {

        computeSize2D(this)
    }

    computeChildrenPosition2D() {

        computeChildrenPosition2D(this)
    }
}
