import { onEntries } from '../utils'
import AidCtxRefsHolder from './AidCtxRefsHolder'

const nodeDomMap = {
  doc: 'div',
  paragraph: 'p',
  text: 'span',
  hard_break: 'br',
  blockquote: 'blockquote',
  code_block: 'pre',
  heading: 'h1',
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
  id: { default: '' },
  class: { default: '' },
  group: { default: '' },
  viewid: { default: '' },
  dataset: { default: {} },
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
      aidctx: dom.getAttribute('data-aidctx'),
    },
  }),
})

const nodeConfig = {
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
  image: {
    attrs: {
      ...commonAttrs,
      src: { default: '' },
      alt: { default: null },
      class: { default: 'aid-snip-img-default' },
      dataset: { default: {} },
    },
    parseDOM: [
      {
        tag: 'img',
        getAttrs(dom) {
          return {
            src: dom.getAttribute('src'),
            alt: dom.getAttribute('alt'),
            id: dom.getAttribute('data-id'),
            class: dom.getAttribute('class') || 'aid-snip-img-default',
            group: dom.getAttribute('data-group'),
            viewid: dom.getAttribute('data-viewid'),
            dataset: {
              aidctx: dom.getAttribute('data-aidctx'),
              imagekey: dom.getAttribute('data-imagekey'),
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
        'data-imagekey': node.attrs.dataset.imagekey,
      }

      return ['img', attrs, 0]
    },
  },
  blockquote: { group: 'block', content: 'block+' },
  article: { group: 'block', content: 'block+' },
  figure: { group: 'block', content: 'block+' },
  table: { group: 'block', content: 'table_row+' },
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
      const config = nodeConfig[pmName] || {}
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
                  aidctx: dom.getAttribute('data-aidctx'),
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
                aidctx: dom.getAttribute('data-aidctx'),
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
  },
  marks: {},
}

export default AiStudioSchema
