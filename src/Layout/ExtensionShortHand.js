export default Layout => {

    Object.defineProperties(Layout.prototype, {

        padding: {

            set(value) {

                this.paddingStart =
                this.paddingEnd = value

                if (this.normalLayout) {

                    this.normal.paddingStart =
                    this.normal.paddingEnd = value
                }
            },
        },

        offsetAlign: {

            set(value) {

                this.align =
                this.offset = value
            },
        },
    })
}
