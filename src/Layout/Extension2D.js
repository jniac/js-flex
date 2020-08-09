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

        horizontal: {

            get() {

                return this.direction === 'horizontal'
            },

            set(value) {

                this.direction = value ? 'horizontal' : 'vertical'
            },
        },

        vertical: {

            get() {

                return this.direction === 'vertical'
            },

            set(value) {

                this.direction = value ? 'vertical' : 'horizontal'
            },
        },

        normalSize: {

            get() {

                return this.normal?.size ?? 0
            },

            set(value) {

                this.ensureNormal().size = value
            },
        },

        width: {

            get() {

                return this.horizontal ? this.size : this.normal?.size
            },

            set(value) {

                if (this.horizontal) {

                    this.size = value

                } else {

                    this.ensureNormal().size = value
                }
            },
        },

        height: {

            get() {

                return this.horizontal ? this.normal?.size : this.size
            },

            set(value) {

                if (this.horizontal) {

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
