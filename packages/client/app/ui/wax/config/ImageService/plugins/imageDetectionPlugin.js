import { Plugin } from 'prosemirror-state'

function imageDetectionPlugin() {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      const addedImages = []
      const removedImages = []

      const getAllImages = doc => {
        const images = []
        doc.descendants(node => {
          if (node.type.name === 'image') {
            images.push(node)
          }
        })
        return images
      }

      const oldImages = getAllImages(oldState.doc)
      const newImages = getAllImages(newState.doc)

      // An image is inserted if it exists in newImages but not in oldImages
      newImages.forEach(newNode => {
        const isNew = !oldImages.some(oldNode => oldNode.eq(newNode))

        if (isNew) {
          addedImages.push(newNode)
        }
      })

      // Detect removed images:
      // An image is removed if it exists in oldImages but not in newImages
      oldImages.forEach(oldNode => {
        const isRemoved = !newImages.some(newNode => newNode.eq(oldNode))

        if (isRemoved) {
          removedImages.push(oldNode)
        }
      })

      if (addedImages.length > 0) {
        console.log('Images added:', addedImages)
      }

      if (removedImages.length > 0) {
        console.log('Images removed:', removedImages)
      }

      return null
    },
  })
}

export default imageDetectionPlugin
