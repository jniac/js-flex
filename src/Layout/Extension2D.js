export default Layout => {

    Object.assign(Layout.prototype, {

        ensureNormal() {

            if (!this.normal)
                this.normal = new Layout()

            return this.normal
        },
    })

    Object.defineProperties(Layout.prototype, {

        is2D: {

            get() {

                return !!this.normal
            },
        },

        isHorizontal: {

            get() {

                return this.direction === 'horizontal'
            },
        },

        isVertical: {

            get() {

                return this.direction === 'vertical'
            },
        },

        width: {

            get() {

                return this.isHorizontal ? this.size : this.normal?.size
            },

            set(value) {

                if (this.isHorizontal) {

                    this.size = value

                } else {

                    this.ensureNormal().size = value
                }
            },
        },

        height: {

            get() {

                return this.isHorizontal ? this.normal?.size : this.size
            },

            set(value) {

                if (this.isHorizontal) {

                    this.ensureNormal().size = value

                } else {

                    this.size = value
                }
            },
        },

        paddingLeft: {

            get() {

                return this.paddingStart
            },

            set(value) {

                this.paddingStart = value
            },
        },

        paddingRight: {

            get() {

                return this.paddingStart
            },

            set(value) {

                this.paddingStart = value
            },
        },

        paddingTop: {

            get() {

                return this.normal?.paddingStart
            },

            set(value) {

                this.ensureNormal().paddingStart = value
            },
        },

        paddingBottom: {

            get() {

                return this.normal?.paddingEnd
            },

            set(value) {

                this.ensureNormal().paddingEnd = value
            },
        },
    })
}
