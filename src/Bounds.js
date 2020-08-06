
// https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
const overlap = (aMin, aMax, bMin, bMax) => aMin <= bMax && aMax >= bMin

export default class Bounds {

    constructor() {

        this.position = 0
        this.size = 0
        this.normal = null
    }

    ensureNormal() {

        if (!this.normal)
            this.normal = new Bounds()

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

    get width() { return this.size }
    get height() { return this.normal?.size ?? 0 }

    get position2D() { return [this.x, this.y] }
    get size2D() { return [this.width, this.height] }
    get rect() { return [this.x, this.y, this.width, this.height] }
}
