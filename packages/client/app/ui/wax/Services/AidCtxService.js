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
    dataset: { default: { id: null } },
  },
  group: 'figure',
  draggable: false,
  parseDOM: [
    {
      tag: 'img',
      getAttrs(hook, next) {
        const id = hook.dom.getAttribute('data-id') || uuid()

        Object.assign(hook, {
          src: hook.dom.getAttribute('src'),
          title: hook.dom.getAttribute('title'),
          id: hook.dom.dataset.id,
          class: hook.dom.getAttribute('class'),
          dataset: { id },
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
    // if (hook.node.attrs.track && hook.node.attrs.track.length) {
    //   // attrs['data-track'] = JSON.stringify(hook.node.attrs.track);
    //   attrs['data-id'] = hook.node.attrs.id
    // }

    const {
      src,
      alt,
      title,
      dataset,
      fileid,
      class: classAttr,
    } = hook.node.attrs
    const longDescId = hook.node.attrs['aria-describedby']
    const longDesc = hook.node.attrs['aria-description']
    const id = dataset.id || uuid()

    const { extraData } = hook.node.attrs
    // eslint-disable-next-line no-param-reassign
    hook.value = [
      'img',
      {
        src: src ?? null,
        alt,
        title,
        class: classAttr,
        'data-id': id,
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
