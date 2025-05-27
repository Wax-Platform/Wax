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
  const imageId = uuidv4(); // Unique ID for the image
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

      // Get fresh state
      const { state, dispatch } = context.pmViews.main;
      const { schema } = state;

      // Find placeholder position
      let placeholderPos = findPlaceholder(
        state,
        placeholderId,
        placeholderPlugin,
      );

      // If placeholder not found, use current selection as fallback
      if (placeholderPos === null) {
        placeholderPos = state.selection.from;
        console.warn('Placeholder not found, using selection position');
      }

      // Create the image node with the unique ID
      const imageNode = schema.nodes.image.create({
        src: url,
        id: imageId,
        extraData,
        ...(showLongDesc ? { 'aria-describedby': uuidv4() } : {}),
      });

      // Create single transaction that does everything atomically
      const tr = state.tr;

      try {
        const resolved = state.doc.resolve(placeholderPos);
        const { parent } = resolved;

        // Handle different insertion scenarios
        if (parent.type.name === 'paragraph' && parent.content.size === 0) {
          // Replace empty paragraph with image
          const from = resolved.before();
          const to = resolved.after();
          tr.replaceWith(from, to, imageNode);
        } else if (parent.type.name === 'paragraph') {
          // Insert image in paragraph
          tr.insert(placeholderPos, imageNode);
        } else {
          // Wrap in paragraph if needed
          const paragraphWithImage = schema.nodes.paragraph.create(
            {},
            imageNode,
          );
          tr.insert(placeholderPos, paragraphWithImage);
        }

        // Remove placeholder in the same transaction
        tr.setMeta(placeholderPlugin, { remove: { id: placeholderId } });

        // Add metadata to help track this operation
        tr.setMeta('imageUpload', {
          action: 'insert',
          imageId: imageId,
          placeholderId: placeholderId,
        });

        context.setOption({ uploading: false });
        dispatch(tr);

        // Debug: Log success
        console.log('Image inserted successfully:', imageId);
      } catch (error) {
        console.error('Error during image insertion:', error);

        // Fallback: just remove placeholder
        const fallbackTr = state.tr
          .setMeta(placeholderPlugin, { remove: { id: placeholderId } })
          .setMeta('imageUpload', { action: 'failed', placeholderId });

        context.setOption({ uploading: false });
        dispatch(fallbackTr);
      }
    },
    error => {
      console.error('Upload failed:', error);

      // Clean removal on upload failure
      const currentState = context.pmViews.main.state;
      const trFailure = currentState.tr
        .setMeta(placeholderPlugin, { remove: { id: placeholderId } })
        .setMeta('imageUpload', { action: 'uploadFailed', placeholderId });

      view.dispatch(trFailure);
      context.setOption({ uploading: false });
    },
  );
};
