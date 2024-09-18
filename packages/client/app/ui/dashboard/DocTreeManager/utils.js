export const findFirstDocument = data => {
  for (let node of data) {
    if (!node.isFolder && node.identifier) {
      return node
    }
    if (node.children) {
      for (let child of node.children) {
        return findFirstDocument([child])
      }
    }
  }

  return null
}

export const findParentNode = (data, childKey) => {
  for (let node of data) {
    if (node.children) {
      for (let child of node.children) {
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

export const findChildNodeByIdentifier = (data, identifier) => {
  for (let node of data) {
    if (node.children) {
      for (let child of node.children) {
        if (child.identifier === identifier) {
          return child
        }
      }
      const found = findChildNodeByIdentifier(node.children, identifier)
      if (found) {
        return found
      }
    }
  }

  return null
}
