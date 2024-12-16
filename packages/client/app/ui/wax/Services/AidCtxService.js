import { uuid } from '@coko/client'
import { Service } from 'wax-prosemirror-core'
const { assign } = Object

function getAttrs(hook, next) {
  console.log({ hook })
  const aidctx = uuid()
  const { class: cls } = hook.dom.getAttribute('class') ?? null
  assign(hook, { aidctx, class: cls })
  next()
}
const toDOM = tag => (hook, next) => {
  const { node, value } = hook
  /* The first value is tagName (eg.: "h1, "p") */
  const [, attrs] = value
  const aidctx = uuid()
  hook.value = [
    tag,
    { ...attrs, 'data-aidctx': aidctx, class: node.attrs.class },
    0,
  ]
  next()
}
// TODO: This is creating the uuids every time
// fix to add classes too
class AidCtxService extends Service {
  name = 'AidCtxService'
  boot() {}

  register() {
    const createNode = this.container.get('CreateNode')
    createNode(
      {
        title: {
          content: 'inline*',
          group: 'block',
          defining: true,
          attrs: {
            class: { default: null },
            dataset: { aidctx: { default: null } },
          },
          parseDOM: [
            {
              tag: 'h1',
              getAttrs,
            },
          ],
          toDOM: toDOM('h1'),
        },
      },
      { toWaxSchema: true },
    )
    createNode(
      {
        heading2: {
          content: 'inline*',
          group: 'block',
          defining: true,
          attrs: {
            class: { default: null },
            dataset: { aidctx: { default: null } },
          },
          parseDOM: [
            {
              tag: 'h2',
              getAttrs,
            },
          ],
          toDOM: toDOM('h2'),
        },
      },
      { toWaxSchema: true },
    )
    //   createNode(
    //     {
    //       paragraph: {
    //         attrs: {
    //           class: { default: null },
    //           dataset: { aidctx: { default: null } },
    //         },
    //         parseDOM: [
    //           {
    //             tag: 'p',
    //             getAttrs,
    //           },
    //         ],
    //         toDOM: toDOM('p'),
    //       },
    //     },
    //     { toWaxSchema: true },
    //   )
  }
}
export default AidCtxService
