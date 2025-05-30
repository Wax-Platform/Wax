import { v4 as uuidv4 } from 'uuid'
import { Commands } from 'wax-prosemirror-core'

const findPlaceholderDecoration = (state, id, placeholderPlugin) => {
  const decos = placeholderPlugin.getState(state)
  return decos.find(null, null, spec => spec.id === id)[0]
}

export default (view, fileUpload, placeholderPlugin, context, app) => file => {
  console.log('file actual upload')
  const trackChange = app.config.get('config.EnableTrackChangeService')
  const imageConfig = app.config.get('config.ImageService')
  const showLongDesc = imageConfig && imageConfig.showLongDesc

  if (trackChange?.enabled) {
    const selectionNodeSize = context.pmViews.main.state.doc.resolve(
      context.pmViews.main.state.tr.selection.from,
    ).parent.nodeSize
    if (selectionNodeSize !== 2) {
      Commands.simulateKey(context.pmViews.main, 13, 'Enter')
    }
  }

  const id = {}
  let { tr } = context.pmViews.main.state
  const uploadPos = tr.selection.from

  tr.setMeta(placeholderPlugin, {
    add: { id, pos: uploadPos },
  })
  view.dispatch(tr)

  console.log(' before fileUpload exec')
  fileUpload(file).then(
    fileData => {
      console.log(fileData, 'fileData on fileUpload')
      let url = fileData
      let extraData = {}
      if (typeof fileData === 'object') {
        url = fileData.url
        extraData = fileData.extraData
      }

      const placeholderDeco = findPlaceholderDecoration(
        view.state,
        id,
        placeholderPlugin,
      )

      if (!placeholderDeco) {
        console.log('placeholder decoration not found')
        return // Placeholder was likely removed by user action or lost due to collaboration
      }

      const pos = placeholderDeco.from
      const { state, dispatch } = context.pmViews.main
      const { schema } = state
      const resolved = state.doc.resolve(pos)
      const { parent } = resolved

      const isEmptyParagraph =
        parent.type.name === 'paragraph' && parent.content.size === 0

      const imageNode = schema.nodes.image.create({
        src: url,
        id: uuidv4(),
        fileid: extraData.fileId,
        extraData,
        ...(showLongDesc ? { 'aria-describedby': uuidv4() } : {}),
      })

      let imageTr = state.tr
      if (isEmptyParagraph) {
        const from = resolved.before()
        const to = resolved.after()
        imageTr = imageTr.replaceWith(from, to, imageNode)
      } else {
        imageTr = imageTr.replaceWith(pos, pos, imageNode)
      }

      imageTr.setMeta(placeholderPlugin, { remove: { id } })
      context.setOption({ uploading: false })
      dispatch(imageTr)
    },
    e => {
      console.log(e)
      // On failure, just clean up the placeholder
      view.dispatch(
        context.pmViews.main.state.tr.setMeta(placeholderPlugin, {
          remove: { id },
        }),
      )
      context.setOption({ uploading: false })
    },
  )
}
