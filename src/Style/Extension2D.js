export default Style => {

    Object.assign(Style.prototype, {

        ensureNormal() {

            if (!this.normal)
                this.normal = new Style()

            return this.normal
        },
    })

    Object.defineProperties(Style.prototype, {

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

                return this.size
            },

            set(value) {

                this.size = value
            },
        },

        height: {

            get() {

                return this.normal?.size
            },

            set(value) {

                this.ensureNormal().size = value
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
