import { uuid } from '@coko/client'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { onEntries } from '../utils'

const nodeDomMap = {
  doc: 'div',
  paragraph: 'p',
  text: 'span',
  hard_break: 'br',
  blockquote: 'blockquote',
  code_block: 'pre',
  heading: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  heading4: 'h4',
  heading5: 'h5',
  title: 'h1',
  horizontal_rule: 'hr',
  bullet_list: 'ul',
  ordered_list: 'ol',
  list_item: 'li',
  image: 'img',
  table: 'table',
  table_row: 'tr',
  table_cell: 'td',
  table_header: 'th',
  table_body: 'tbody',
  media: 'div',
  iframe: 'iframe',
  figure: 'figure',
  figcaption: 'figcaption',
  footnote: 'sup',
  mention: 'span',
  // comment: 'span',
  // highlight: 'mark',
  emoji: 'span',
  task_item: 'li',
  task_list: 'ul',
  math_inline: 'span',
  math_block: 'div',
  attribute: 'div',
  label: 'label',
  diagram: 'div',
  container: 'div',
  span: 'span',
  caption: 'caption',
  aside: 'aside',
  section: 'section',
  article: 'article',
  nav: 'nav',
  header: 'header',
  footer: 'footer',
}

const commonAttrs = {
  id: { default: null },
  class: { default: null },
  group: { default: null },
  viewid: { default: null },
  dataset: { default: { aidctx: uuid() } },
}

const generateHeadingsConfig = level => ({
  tag: `h${level}`,
  getAttrs: dom => ({
    level,
    id: dom.getAttribute('data-id'),
    class: dom.getAttribute('class'),
    group: dom.getAttribute('data-group'),
    viewid: dom.getAttribute('data-viewid'),
    dataset: {
      aidctx: dom.getAttribute('data-aidctx') || uuid(),
    },
  }),
})

const nodesConfig = {
  heading: {
    attrs: {
      ...commonAttrs,
      level: { default: 1 },
    },
    content: 'inline*',
    group: 'block',
    parseDOM: [1, 2, 3, 4, 5, 6].map(generateHeadingsConfig),
    toDOM: node => {
      const attrs = {
        id: node.attrs.id,
        class: node.attrs.class,
        'data-group': node.attrs.group,
        'data-viewid': node.attrs.viewid,
        'data-aidctx': node.attrs.dataset.aidctx,
      }

      return [`h${node.attrs.level}`, attrs, 0]
    },
  },
  title: {
    attrs: {
      ...commonAttrs,
      level: { default: 1 },
    },
    content: 'inline*',
    group: 'block',
    parseDOM: {
      tag: `h1`,
      getAttrs: dom => ({
        id: dom.getAttribute('data-id'),
        class: dom.getAttribute('class'),
        group: dom.getAttribute('data-group'),
        viewid: dom.getAttribute('data-viewid'),
        dataset: {
          aidctx: dom.getAttribute('data-aidctx') || uuid(),
        },
      }),
    },
    toDOM: node => {
      const attrs = {
        id: node.attrs.id,
        class: node.attrs.class,
        'data-group': node.attrs.group,
        'data-viewid': node.attrs.viewid,
        'data-aidctx': node.attrs.dataset.aidctx,
      }

      return [`h1`, attrs, 0]
    },
  },
  image: {
    attrs: {
      ...commonAttrs,
      src: { default: '' },
      alt: { default: null },
      class: { default: 'aid-snip-img-default' },
    },
    inline: false,
    group: 'block',
    content: '',
    parseDOM: [
      {
        tag: 'img',
        getAttrs(dom) {
          return {
            src: dom.getAttribute('src'),
            alt: dom.getAttribute('alt'),
            id: dom.getAttribute('data-id'),
            class: dom.getAttribute('class')?.concat(' aid-snip-img-default'),
            group: dom.getAttribute('data-group'),
            viewid: dom.getAttribute('data-viewid'),
            imagekey: dom.getAttribute('data-imagekey'),
            dataset: {
              aidctx: dom.getAttribute('data-aidctx') || uuid(),
            },
          }
        },
      },
    ],
    toDOM(node) {
      const attrs = {
        id: node.attrs.id,
        class: node.attrs.class,
        src: node.attrs.src,
        alt: node.attrs.alt,
        'data-group': node.attrs.group,
        'data-viewid': node.attrs.viewid,
        'data-aidctx': node.attrs.dataset.aidctx,
        'data-imagekey': node.attrs.imagekey,
      }

      return ['img', attrs, 0]
    },
  },
  blockquote: { group: 'block', content: 'block+' },
  article: { group: 'block', content: 'block+' },
  figure: { group: 'block', content: 'block+' },
  table: {
    attrs: { ...commonAttrs },
    group: 'block',
    content: 'table_row+',
    parseDOM: [
      {
        tag: 'table',
        getAttrs(dom) {
          return {
            src: dom.getAttribute('src'),
            alt: dom.getAttribute('alt'),
            id: dom.getAttribute('data-id'),
            class: dom.getAttribute('class'),
            group: dom.getAttribute('data-group'),
            viewid: dom.getAttribute('data-viewid'),
            dataset: {
              aidctx: dom.getAttribute('data-aidctx') || uuid(),
            },
          }
        },
      },
    ],
    toDOM(node) {
      const attrs = {
        id: node.attrs.id,
        class: node.attrs.class,
        src: node.attrs.src,
        alt: node.attrs.alt,
        'data-group': node.attrs.group,
        'data-viewid': node.attrs.viewid,
        'data-aidctx': node.attrs.dataset.aidctx,
      }

      return ['table', attrs, 0]
    },
  },
  table_row: { group: 'block', content: '(table_cell | table_header)*' },
  list_item: { group: 'block', content: 'list_item block' },
  bullet_list: { group: 'block', content: 'list_item+' },
  ordered_list: { group: 'block', content: 'list_item+' },
  task_list: { group: 'block', content: 'list_item+' },
  task_item: { group: 'block', content: 'list_item block' },
}

const createNodeSchema = () => {
  const nodes = {}

  onEntries(nodeDomMap, (pmName, tag) => {
    if (pmName === 'text') {
      nodes[pmName] = {
        group: 'inline',
      }
    } else {
      const config = nodesConfig[pmName] || {}
      nodes[pmName] = {
        group: config.group || 'block',
        content: config.content || 'inline*',
        attrs: { ...commonAttrs, ...config.attrs },
        parseDOM: config.parseDOM || [
          {
            tag,
            getAttrs(dom) {
              return {
                id: dom.getAttribute('data-id'),
                class: dom.getAttribute('class'),
                group: dom.getAttribute('data-group'),
                viewid: dom.getAttribute('data-viewid'),
                dataset: {
                  aidctx: dom.getAttribute('data-aidctx') || uuid(),
                },
              }
            },
          },
        ],
        toDOM:
          config.toDOM ||
          (node => {
            const attrs = {
              id: node.attrs.id,
              class: node.attrs.class,
              'data-group': node.attrs.group,
              'data-viewid': node.attrs.viewid,
              'data-aidctx': node.attrs.dataset.aidctx,
            }

            return [tag, attrs, 0]
          }),
      }
    }
  })

  return nodes
}

const AiStudioSchema = {
  nodes: {
    ...createNodeSchema(),
    doc: {
      content: 'block+',
      attrs: commonAttrs,
      parseDOM: [
        {
          tag: 'div',
          getAttrs(dom) {
            return {
              id: dom.getAttribute('data-id'),
              class: dom.getAttribute('class'),
              group: dom.getAttribute('data-group'),
              viewid: dom.getAttribute('data-viewid'),
              dataset: {
                aidctx: dom.getAttribute('data-aidctx') || uuid(),
              },
            }
          },
        },
      ],
      toDOM: node => {
        const attrs = {
          id: node.attrs.id,
          class: node.attrs.class,
          'data-group': node.attrs.group,
          'data-viewid': node.attrs.viewid,
          'data-aidctx': node.attrs.dataset.aidctx,
        }

        return ['div', attrs, 0]
      },
    },
    text: {
      group: 'inline',
    },
    hard_break: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM() {
        return ['br']
      },
    },
    div: {
      content: 'block+',
      attrs: commonAttrs,
      parseDOM: [
        {
          tag: 'div',
          getAttrs(dom) {
            return {
              id: dom.getAttribute('data-id'),
              class: dom.getAttribute('class'),
              group: dom.getAttribute('data-group'),
              viewid: dom.getAttribute('data-viewid'),
              dataset: {
                aidctx: dom.getAttribute('data-aidctx') || uuid(),
              },
            }
          },
        },
      ],
      toDOM: node => {
        const attrs = {
          id: node.attrs.id,
          class: node.attrs.class,
          'data-group': node.attrs.group,
          'data-viewid': node.attrs.viewid,
          'data-aidctx': node.attrs.dataset.aidctx,
        }

        return ['div', attrs, 0]
      },
    },
  },
  marks: {},
}

export default AiStudioSchema
