import { uuid } from '@coko/client'
import { Service } from 'wax-prosemirror-core'
const { assign } = Object
const imageNode = {
  attrs: {
    id: { default: '' },
    src: {},
    alt: { default: '' },
    title: { default: null },
    class: { default: '' },
    extraData: { default: {} },
    // track: { default: [] },
    fileid: { default: null },
    'aria-describedby': { default: '' },
    'aria-description': { default: '' },
    dataset: { default: {} },
  },
  group: 'figure',
  draggable: false,
  parseDOM: [
    {
      tag: 'img',
      getAttrs(hook, next) {
        Object.assign(hook, {
          src: hook.dom.getAttribute('src'),
          title: hook.dom.getAttribute('title'),
          id: hook.dom.dataset.id,
          class: hook.dom.getAttribute('class'),
          // track: SchemaHelpers.parseTracks(hook.dom.dataset.track),
          alt: hook.dom.getAttribute('alt'),
          fileid: hook.dom.dataset.fileid,
          'aria-describedby': hook.dom.dataset['aria-describedby'],
          'aria-description': hook.dom.getAttribute('aria-description'),
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    const attrs = {}
    if (hook.node.attrs.track && hook.node.attrs.track.length) {
      // attrs['data-track'] = JSON.stringify(hook.node.attrs.track);
      attrs['data-id'] = hook.node.attrs.id
    }

    const { src, alt, title, id, fileid, class: classAttr } = hook.node.attrs
    const longDescId = hook.node.attrs['aria-describedby']
    const longDesc = hook.node.attrs['aria-description']

    const { extraData } = hook.node.attrs
    // eslint-disable-next-line no-param-reassign
    hook.value = [
      'img',
      {
        src:
          src !== ''
            ? src
            : 'data:image/png;base64,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',
        alt,
        title,
        class: classAttr,
        'data-id': id === '' ? uuid() : id,
        // 'data-track': track,
        'data-fileid': fileid,
        ...Object.keys(extraData).reduce((obj, key) => {
          // eslint-disable-next-line no-param-reassign
          obj[`data-${key}`] = extraData[key]
          return obj
        }, {}),
        ...(longDescId && longDescId !== ''
          ? {
              'aria-describedby': longDescId,
              'aria-description': longDesc,
            }
          : {}),
      },
    ]

    next()
  },
}

function getAttrs(hook, next) {
  const id = hook.dom.getAttribute('data-id') || uuid()
  const cls = hook.dom.getAttribute('class') || null
  assign(hook, { dataset: { id }, class: cls })
  // console.log('getAttrs updated hook:', hook)
  next()
}

const toDOM = tag => (hook, next) => {
  const { node, value } = hook
  const [, attrs] = value
  const id = node.attrs.dataset?.id || uuid()
  hook.value = [tag, { ...attrs, 'data-id': id, class: node.attrs.class }, 0]
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
            dataset: { id: { default: null } },
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
            dataset: { id: { default: null } },
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
            dataset: { id: { default: null } },
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
    createNode(
      {
        image: imageNode,
      },
      { toWaxSchema: true },
    )
  }
}

export default AidCtxService
