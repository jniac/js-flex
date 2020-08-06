/**
 * returns
 * @return {Array} [freeOffset, extraGutter, extraPaddingStart]
 */
export default (justify, freeSpace, gutterCount) => {

    if (justify.endsWith('%')) {

        return [parseFloat(justify) / 100, 0, 0]
    }

    let freeOffset = 0
    let extraGutter = 0
    let extraPaddingStart = 0

    switch (justify) {

        case 'start':
            freeOffset = 0
            break

        default:
        case 'center':
            freeOffset = .5
            break

        case 'end':
            freeOffset = 1
            break

        case 'space-between':

            if (gutterCount === 0) {

                freeOffset = .5

            } else {

                extraGutter = freeSpace / gutterCount
            }
            break

        case 'space-evenly':

            if (gutterCount === 0) {

                freeOffset = .5

            } else {

                extraGutter = freeSpace / (gutterCount + 2)
                extraPaddingStart = extraGutter
            }
            break

        case 'space-around':

            if (gutterCount === 0) {

                freeOffset = .5

            } else {

                extraGutter = freeSpace / (gutterCount + 1)
                extraPaddingStart = extraGutter / 2
            }
            break
    }

    return [freeOffset, extraGutter, extraPaddingStart]
}
