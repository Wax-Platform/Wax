import { Plugin, PluginKey } from 'prosemirror-state'
import { DOMSerializer } from 'prosemirror-model'
import { debounce, each } from 'lodash'

/**
 * Creates a plugin that serializes the ProseMirror state to HTML
 * and stores it in the Y.Text 'html' field on every document change.
 *
 * @param {Y.Doc} ydoc - The shared Yjs document
 * @param {Object} options - Optional config
 * @param {number} options.debounceMs - Debounce time in ms (default: 1000ms)
 * @returns {Plugin}
 */
export default (ydoc, provider, { debounceMs = 1000 } = {}) => {
  const htmlText = ydoc.getText('html')
  let prevDoc = null

   const isLeader = () => {
    const awareness = provider.awareness
    const states = Array.from(awareness.getStates().keys());
    return Math.min(...states) === awareness.clientID;
  };

  const alterNotesSchema = schema => {
  const notes = [];
  each(schema.nodes, node => {
    if (node.groups.includes('notes')) notes.push(node);
  });
  if (notes.length > 0) {
    notes.forEach(note => {
      schema.nodes[note.name].spec.toDOM = node => {
        if (node) return [note.name, node.attrs, 0];
        return true;
      };
    });
  }
};

const revertNotesSchema = schema => {
  const notes = [];
  each(schema.nodes, node => {
    if (node.groups.includes('notes')) notes.push(node);
  });
  if (notes.length > 0) {
    notes.forEach(note => {
      schema.nodes[note.name].spec.toDOM = node => {
        if (node) return [note.name, node.attrs];
        return true;
      };
    });
  }
};




  const updateHTML = view => {
    alterNotesSchema(view.state.schema)
    const serializer = DOMSerializer.fromSchema(view.state.schema)
    const fragment = serializer.serializeFragment(view.state.doc.content)
    const container = document.createElement('div')
    container.appendChild(fragment)
    const html = container.innerHTML
    revertNotesSchema(view.state.schema)
    

    if (isLeader()) {
      htmlText.doc?.transact(() => {
        htmlText.delete(0, htmlText.length)
        htmlText.insert(0, html)
      })
    }
  }

  // const debouncedUpdate = debounce(updateHTML, debounceMs)

  return new Plugin({
    key: new PluginKey('yjs-html-sync'),
    view() {
      return {
        update(v) {
          if (!prevDoc || !v.state.doc.eq(prevDoc)) {
            prevDoc = v.state.doc
            updateHTML(v)
            // debouncedUpdate(v)
          }
        },
      }
    },
  })
}
