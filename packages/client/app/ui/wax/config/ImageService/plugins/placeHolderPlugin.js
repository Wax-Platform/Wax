import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export default key =>
  new Plugin({
    key: new PluginKey(key),
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, set) {
        // Map existing decorations through the document changes
        set = set.map(tr.mapping, tr.doc);

        const action = tr.getMeta(this);
        if (action?.add) {
          // Create a visible placeholder element
          const widget = document.createElement('placeholder');
          // widget.className = 'placeholder';
          // widget.textContent = 'Uploading...'; // Optional visible text

          const deco = Decoration.widget(action.add.pos, widget, {
            id: action.add.id,
          });

          set = set.add(tr.doc, [deco]);
        }

        if (action?.remove) {
          const found = set.find(null, null, spec => spec.id === action.remove.id);
          if (found.length) {
            set = set.remove(found);
          }
        }

        return set;
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
