// import { Plugin } from 'prosemirror-state';
// import { DOMSerializer } from 'prosemirror-model';
// import { debounce } from 'lodash';

// export default ({ ydoc, yXmlFragment, fieldName = 'html', debounceMs = 1000 }) => {
//   const htmlText = ydoc.getText(fieldName);
//   let prevHTML = null;

//   const updateHTML = debounce((view) => {
//     const serializer = DOMSerializer.fromSchema(view.state.schema);
//     const fragment = serializer.serializeFragment(view.state.doc.content);
//     const div = document.createElement('div');
//     div.appendChild(fragment);
//     const html = div.innerHTML;

//     if (html !== prevHTML) {
//       prevHTML = html;
//       htmlText.doc?.transact(() => {
//         htmlText.delete(0, htmlText.length);
//         htmlText.insert(0, html);
//       });
//     }
//   }, debounceMs);

//   return new Plugin({
//     view(view) {
//       const observeHandler = () => updateHTML(view);

//       yXmlFragment.observeDeep(observeHandler); // ensures sync even in solo editing
//       updateHTML(view); // Initial

//       return {
//         update(view) {
//           updateHTML(view); // optional, but nice to keep for cursor or undo detection
//         },
//         destroy() {
//           yXmlFragment.unobserveDeep(observeHandler);
//         }
//       };
//     }
//   });
// }
import { Plugin } from 'prosemirror-state'
import { DOMSerializer } from 'prosemirror-model'
import { debounce } from 'lodash'

/**
 * Creates a plugin that serializes the ProseMirror state to HTML
 * and stores it in the Y.Text 'html' field on every document change.
 *
 * @param {Y.Doc} ydoc - The shared Yjs document
 * @param {Object} options - Optional config
 * @param {number} options.debounceMs - Debounce time in ms (default: 1000ms)
 * @returns {Plugin}
 */
export default (ydoc, { debounceMs = 1000 } = {}) => {
  const htmlText = ydoc.getText('html')
  let prevDoc = null

  const updateHTML = (view) => {
    const serializer = DOMSerializer.fromSchema(view.state.schema)
    const fragment = serializer.serializeFragment(view.state.doc.content)
    const container = document.createElement('div')
    container.appendChild(fragment)
    const html = container.innerHTML

    htmlText.doc?.transact(() => {
      htmlText.delete(0, htmlText.length)
      htmlText.insert(0, html)
    })
  }

  const debouncedUpdate = debounce(updateHTML, debounceMs)

  return new Plugin({
    view(view) {
      // Initial content push
      debouncedUpdate(view)

      window.addEventListener('beforeunload', () => {
        // Force sync before unload
        updateHTML(view)
      })

      return {
        update(view) {
          if (!prevDoc || !view.state.doc.eq(prevDoc)) {
            prevDoc = view.state.doc
            debouncedUpdate(view)
          }
        },
        destroy() {
          updateHTML(view)
        },
      }
    },
  })
}
