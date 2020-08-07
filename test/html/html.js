// https://gist.github.com/jniac/1f1b8e57dbb320138af00680c090f94e

const parser = new DOMParser()

const html = (strings, ...inserts) => {

    if (typeof strings === 'string') {

        // html is used as a regular function, eg:
        // html(`<div>${foo}</div>`)
        return parser.parseFromString(strings, 'text/html').body.firstChild
    }

    // html is used as a "tagged templates" (allowing nested object), eg:
    // html`<div>${fooAsHTMLElement}</div>`

    strings = [...strings]
    inserts = [...inserts]

    const array = [strings[0]]

    // flatten template entries and unpack dom bundle
    for (let index = 0; index < inserts.length;) {

        const insert = inserts[index]

        if (Array.isArray(insert)) {

            // flatten array...
            inserts.splice(index, 1, ...insert)
            // ...and insert missing separators
            strings.splice(index + 1, 0, ...insert.slice(0, -1).map(() => ''))

        } else {

            // unpack { element }
            if (insert && insert.element && insert.element instanceof HTMLElement)
                inserts[index] = insert.element

            // increments only if item was NOT an array
            // this way arrays of arrays will also be flatten
            index++
        }
    }

    const now = Date.now()

    for (let i = 0; i < inserts.length; i++) {

        const insert = inserts[i]

        if (insert instanceof HTMLElement) {

            const tag = insert.tagName.toLowerCase()
            array.push(`<${tag} class="__INSERT_${now}__">${i}</${tag}>`)

        } else {

            array.push(insert)
        }

        array.push(strings[i + 1])
    }

    const doc = parser.parseFromString(array.join(''), 'text/html')

    for (const element of doc.body.querySelectorAll(`.__INSERT_${now}__`)) {

        const index = parseInt(element.innerText)
        const insert = inserts[index]

        if (insert !== null) {

            element.replaceWith(insert)

        } else {

            element.remove()
        }
    }

    return doc.body.childElementCount > 1
        ? doc.body.children
        : doc.body.firstChild
}

export default html
