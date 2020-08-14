import Node from '../Node.js'
import Bounds from '../Bounds.js'
import Style from '../Style/Style.js'

import size from './size.js'
import size2D from './size2D.js'
import childrenPosition from './childrenPosition.js'
import childrenPosition2D from './childrenPosition2D.js'

const orderSorter = (A, B) => A.style.order < B.style.order ? -1 : 1

export default class ComputeNode extends Node {

    constructor(sourceNode, parent) {

        super()

        this.bounds = new Bounds()
        this.style = new Style()

        this.sourceNode = sourceNode
        this.parent = parent

        // 'selfSizeReady' vs 'proportionalSizeReady'
        // 'selfSizeReady' is true when bounds.size has been computed
        // 'proportionalSizeReady' can be computed only after that 'selfSizeReady' is true
        this.selfSizeReady = false
        this.proportionalSizeReady = false

        // 2D props
        this.selfHorizontalSizeReady = false
        this.selfVerticalSizeReady = false

        this.absoluteChildren = null
        this.nonAbsoluteChildren = null

        this.fixedChildren = null
        this.relativeChildren = null
        this.proportionalChildren = null

        this.proportionalWeight = NaN
    }

    computeSizeIsDone() {

        return this.selfSizeReady && this.proportionalSizeReady
    }

    computeSize() {

        size(this)
    }

    computeChildrenPosition() {

        childrenPosition(this)
    }

    computeSize2D() {

        size2D(this)
    }

    computeChildrenPosition2D() {

        childrenPosition2D(this)
    }
}
