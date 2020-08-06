export default Layout => {

    Object.defineProperties(Layout.prototype, {

        padding: {

            set(value) {

                this.paddingStart =
                this.paddingEnd = value

                if (this.normal) {

                    this.normal.paddingStart =
                    this.normal.paddingEnd = value
                }
            },
        },

        spacing: {

            set(value) {

                this.padding = value
                this.gutter = value
            },
        },

        sides: {

            set(value) {

                this.width = value
                this.height = value
            }
        },

        absoluteOffsetAlign: {

            set(value) {

                this.absoluteAlign =
                this.absoluteOffset = value
            },
        },
    })
}
