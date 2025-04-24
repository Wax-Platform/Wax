/* eslint-disable no-restricted-syntax */
export const findFirstDocument = data => {
  for (const node of data) {
    if (!node.isFolder && node.bookComponentId) {
      return node
    }

    if (node.children) {
      // eslint-disable-next-line no-unreachable-loop
      for (const child of node.children) {
        return findFirstDocument([child])
      }
    }
  }

  return null
}

export const findParentNode = (data, childKey) => {
  for (const node of data) {
    if (node.children) {
      for (const child of node.children) {
        if (child.key === childKey) {
          return node
        }
      }

      const found = findParentNode(node.children, childKey)

      if (found) {
        return found
      }
    }
  }

  return null
}

export const findChildNodeByBookComponentId = (data, bookComponentId) => {
  for (const node of data) {
    if (node.children) {
      for (const child of node.children) {
        if (child.bookComponentId === bookComponentId) {
          return child
        }
      }

      const found = findChildNodeByBookComponentId(
        node.children,
        bookComponentId,
      )

      if (found) {
        return found
      }
    }
  }

  return null
}
