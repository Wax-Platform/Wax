import { uuid } from '@coko/client'
import { Service } from 'wax-prosemirror-core'
const { assign } = Object

function getAttrs(hook, next) {
  const aidctx = hook.dom.getAttribute('data-aidctx') || uuid()
  const cls = hook.dom.getAttribute('class') || null
  assign(hook, { dataset: { aidctx }, class: cls })
  console.log('getAttrs updated hook:', hook)
  next()
}

const toDOM = tag => (hook, next) => {
  const { node, value } = hook
  const [, attrs] = value
  const aidctx = node.attrs.dataset?.aidctx || uuid()
  hook.value = [
    tag,
    { ...attrs, 'data-aidctx': aidctx, class: node.attrs.class },
    0,
  ]
  next()
}

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
    createNode(
      {
        heading3: {
          content: 'inline*',
          group: 'block',
          defining: true,
          attrs: {
            class: { default: null },
            dataset: { aidctx: { default: null } },
          },
          parseDOM: [
            {
              tag: 'h3',
              getAttrs,
            },
          ],
          toDOM: toDOM('h3'),
        },
      },
      { toWaxSchema: true },
    )
  }
}

export default AidCtxService
