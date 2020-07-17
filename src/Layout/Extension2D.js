export default Layout => {

    Object.assign(Layout.prototype, {

        ensureNormalLayout() {

            if (!this.normalLayout)
                this.normalLayout = new Layout()

            return this.normalLayout
        },
    })

    Object.defineProperties(Layout.prototype, {

        is2D: {

            get() {

                return !!this.normalLayout
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

                return this.isHorizontal ? this.size : this.normalLayout?.size
            },

            set(value) {

                if (this.isHorizontal) {

                    this.size = value

                } else {

                    this.ensureNormalLayout().size = value
                }
            },
        },

        height: {

            get() {

                return this.isHorizontal ? this.normalLayout?.size : this.size
            },

            set(value) {

                if (this.isHorizontal) {

                    this.ensureNormalLayout().size = value

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

                return this.normalLayout?.paddingStart
            },

            set(value) {

                this.ensureNormalLayout().paddingStart = value
            },
        },

        paddingBottom: {

            get() {

                return this.normalLayout?.paddingEnd
            },

            set(value) {

                this.ensureNormalLayout().paddingEnd = value
            },
        },
    })
}
