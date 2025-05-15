import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { DOMParser } from 'prosemirror-model'

const getSyncContentPlugin = new PluginKey('getSyncContentPlugin')

const parser = schema => {
  const WaxParser = DOMParser.fromSchema(schema)

  return content => {
    const container = document.createElement('article')

    container.innerHTML = content
    return WaxParser.parse(container)
  }
}

export default (content = '<p>hello</p>') => {
  return new Plugin({
    key: getSyncContentPlugin,

    state: {
      init() {
        return { inserted: false }
      },
      apply(tr, pluginState, oldState, newState) {
        return { inserted: true }
      },
    },
    view: view => {
      return {
        update: editorView => {
          console.log(content, 'Inside plugin ')
          const pluginState = getSyncContentPlugin.getState(editorView.state)

          if (pluginState.inserted) return

          const {
            config: { schema, plugins },
          } = editorView.state

          const parse = parser(schema)

          const WaxOptions = {
            doc: parse(content),
            schema,
            plugins,
          }

          editorView.updateState(EditorState.create(WaxOptions))

          if (editorView.dispatch) {
            editorView.dispatch(view.state.tr.setMeta('inserted', true))
          }
        },
      }
    },
  })
}
