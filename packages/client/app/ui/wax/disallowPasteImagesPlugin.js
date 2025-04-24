/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
import { v4 as uuidv4 } from 'uuid'
import { Plugin, PluginKey } from 'prosemirror-state'

const disallowPasteImagesPlugin = new PluginKey('disallowPasteImagesPlugin')

// function dataURLtoFile(dataurl, filename) {
//   var arr = dataurl.split(','),
//     // mime = arr[0].match(/:(.*?);/)[1],
//     mime = 'image/jpeg',
//     bstr = atob(arr[arr.length - 1]),
//     n = bstr.length,
//     u8arr = new Uint8Array(n)
//   while (n--) {
//     u8arr[n] = bstr.charCodeAt(n)
//   }
//   return new File([u8arr], filename, { type: mime })
// }

export default callback => {
  return new Plugin({
    key: disallowPasteImagesPlugin,
    props: {
      transformPasted: slice => {
        const {
          content: { content },
        } = slice

        let imageFound = false
        // let src = null
        content.forEach(node => {
          if (node.type.name === 'image' && !node.attrs.fileid) {
            node.attrs.id = uuidv4()
            node.attrs.src = ''
            node.attrs.alt = ''
            imageFound = true
            // src = node.attrs.src
          }

          if (node.type.name === 'figure') {
            if (
              node.firstChild &&
              node.firstChild.type.name === 'image' &&
              !node.firstChild.attrs.fileid
            ) {
              node.firstChild.attrs.id = uuidv4()
              node.firstChild.attrs.src = ''
              node.firstChild.attrs.alt = ''
              imageFound = true
              // src = node.firstChild.attrs.src
            } else if (
              node.lastChild &&
              node.lastChild.type.name === 'image' &&
              !node.lastChild.attrs.fileid
            ) {
              node.lastChild.attrs.id = uuidv4()
              node.lastChild.attrs.src = ''
              node.lastChild.attrs.alt = ''
              // src = node.lastChild.attrs.src
              imageFound = true
            }
          }
        })

        if (imageFound) {
          // var file = dataURLtoFile(src, 'hello.jpg')
          // console.log(file)

          callback()
          return false
          // return slice
        }

        return slice
      },
    },
  })
}
