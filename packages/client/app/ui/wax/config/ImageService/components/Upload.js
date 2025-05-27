import { v4 as uuidv4 } from 'uuid';
import { Commands } from 'wax-prosemirror-core';

const findPlaceholder = (state, id, placeholderPlugin) => {
  const decos = placeholderPlugin.getState(state);
  const found = decos.find(null, null, spec => spec.id === id);
  return found.length ? found[0].from : null;
};

export default (view, fileUpload, placeholderPlugin, context, app) => file => {
  const trackChange = app.config.get('config.EnableTrackChangeService');
  const imageConfig = app.config.get('config.ImageService');
  const showLongDesc = imageConfig && imageConfig.showLongDesc;

  if (trackChange?.enabled)
    if (
      context.pmViews.main.state.doc.resolve(
        context.pmViews.main.state.tr.selection.from,
      ).parent.nodeSize !== 2
    ) {
      Commands.simulateKey(context.pmViews.main, 13, 'Enter');
    }

  const placeholderId = uuidv4();
  const initialPos = context.pmViews.main.state.tr.selection.from;

  let { tr } = context.pmViews.main.state;
  if (!tr.selection.empty) tr.deleteSelection();
  tr.setMeta(placeholderPlugin, {
    add: { id: placeholderId, pos: initialPos },
  });
  view.dispatch(tr);

  fileUpload(file).then(
    fileData => {
      let url = fileData;
      let extraData = {};
      if (typeof fileData === 'object') {
        url = fileData.url;
        extraData = fileData.extraData;
      }

      const { state, dispatch } = context.pmViews.main;
      const { schema } = state;

      // Find the *current* position of the placeholder
      const currentPlaceholderPos = findPlaceholder(
        state,
        placeholderId,
        placeholderPlugin,
      );

      if (currentPlaceholderPos == null) {
        return; // Placeholder was removed
      }

      const resolvedPlaceholder = state.doc.resolve(currentPlaceholderPos);
      const { parent } = resolvedPlaceholder;
      const isEmptyParagraph =
        parent.type.name === 'paragraph' && parent.content.size === 0;

      const imageNode = schema.nodes.image.create({
        src: url,
        id: uuidv4(),
        extraData,
        ...(showLongDesc ? { 'aria-describedby': uuidv4() } : {}),
      });

      const newTr = state.tr; // Create a new transaction

      if (isEmptyParagraph) {
        const from = resolvedPlaceholder.before();
        const to = resolvedPlaceholder.after();
        newTr.replaceWith(from, to, imageNode);
      } else {
        newTr.replaceWith(
          currentPlaceholderPos,
          currentPlaceholderPos,
          imageNode,
        );
      }

      newTr.setMeta(placeholderPlugin, { remove: { id: placeholderId } });
      context.setOption({ uploading: false });
      dispatch(newTr);
    },
    () => {
      const trFailure = context.pmViews.main.state.tr.setMeta(
        placeholderPlugin,
        {
          remove: { id: placeholderId },
        },
      );
      view.dispatch(trFailure);
      context.setOption({ uploading: false });
    },
  );
};
