export default class Bounds {

    constructor() {

        this.position = 0
        this.size = 0
    }

    get min() { return this.position }
    get max() { return this.position + this.size }

    intersects(other) {

        // https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
        return this.min <= other.max && this.max >= other.min
    }
}
