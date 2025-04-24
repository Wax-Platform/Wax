const reorderArray = (array, item, to, from = undefined) => {
  const resArray = []
  let fromClone = from

  for (let i = 0; i < array.length; i += 1) {
    resArray.push(array[i])
  }

  if (from === undefined) {
    resArray.push(item)
    fromClone = from || resArray.length - 1
  }

  const dragged = resArray.splice(fromClone, 1)[0]
  resArray.splice(to, 0, dragged)
  return resArray
}

const isEmptyString = data => {
  let isEmpty = false

  if (!data) {
    isEmpty = true
  } else {
    isEmpty = data.trim().length === 0
  }

  return isEmpty
}

const camelCaseToKebabCase = string =>
  string
    .replace(/\B(?:([A-Z])(?=[a-z]))|(?:(?<=[a-z0-9])([A-Z]))/g, '-$1$2')
    .toLowerCase()

module.exports = { reorderArray, isEmptyString, camelCaseToKebabCase }
