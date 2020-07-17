export default Layout => {

    Object.defineProperties(Layout.prototype, {

        padding: {

            set(value) {

                this.paddingStart =
                this.paddingEnd = value

                if (this.normalLayout) {

                    this.normalLayout.paddingStart =
                    this.normalLayout.paddingEnd = value
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
