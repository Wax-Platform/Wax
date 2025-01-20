import { isArray } from 'lodash'
import AiDesigner from '../AiDesigner'
import { SET } from '../../ui/component-ai-assistant/utils/SetExtension'

const elementFromString = string => {
  const wrappedValue = `<body>${string}</body>`
  const doc = new window.DOMParser().parseFromString(wrappedValue, 'text/html')
  return doc.body
}

export const insertImageAfterNode = imgAttrs => {
  const { view } = AiDesigner.states

  const { state, dispatch } = view
  const { tr, doc, schema } = state

  const { id } = AiDesigner.selected

  const { pos } = findInPmDoc(doc, id) || {}

  const $pos = state.doc.resolve(pos)
  const imageNode = schema.nodes.image.create({
    ...imgAttrs,
  })

  const insertPos = $pos.pos + 1

  const transaction = tr.insert(insertPos, imageNode)

  dispatch(transaction)
}

export const replaceTextAtPos = (view, pos, htmlString, replace = false) => {
  if (!htmlString || typeof pos !== 'number') return

  const { state } = view
  const { tr } = state

  const parser = DOMParser.fromSchema(state.schema)
  const parsedContent = parser.parse(elementFromString(htmlString))

  // Determine the range for replacement if needed
  let deleteFrom = pos,
    deleteTo = pos
  if (replace) {
    const $pos = state.doc.resolve(pos)
    const node = $pos.node()
    deleteTo = pos + node.content.size
  }

  // Apply deletion if replacing, otherwise just insert
  const transaction = replace
    ? tr.delete(deleteFrom, deleteTo).insert(pos, parsedContent)
    : tr.insert(pos, parsedContent)

  view.dispatch(transaction)

  try {
    const currentState = view.state
    const newFrom = pos + parsedContent.content.size
    const docSize = currentState.doc.content.size
    const safeNewTo = Math.min(newFrom, docSize)

    const newStateTr = currentState.tr.setSelection(
      TextSelection.create(currentState.doc, safeNewTo, safeNewTo),
    )

    view.dispatch(newStateTr)
    view.focus()
  } catch (error) {
    console.error('Failed to update selection:', error)
  }
}
export const getAllDescendants = node => {
  let descendants = []

  if (!node?.children?.length) {
    return descendants
  }

  for (let child of node.children) {
    descendants.push(child)
    descendants = descendants.concat(getAllDescendants(child))
  }

  return descendants
}

export const findInPmDoc = (doc, ref) => {
  const found = []
  doc.descendants((node, pos) => {
    if (node?.attrs?.dataset?.id === ref) {
      found.push({ node, pos })
    }
  })
  return found
}
export const findInDom = id => document.querySelector(`[data-id="${id}"]`)

export const addClass = (method, classNames, selected) => {
  if (!AiDesigner?.states?.view) return

  const { view } = AiDesigner.states
  const { id } = selected || {}
  const domNode = findInDom(id)
  const { tr, doc } = view.state

  const node = getAllDescendants(view.docView).find(el =>
    el?.nodeDOM?.dataset?.id?.includes(id),
  )
  const pos = node.posBefore

  // console.log({ node, pos })
  // console.log({ descendants: getAllDescendants(view.docView), doc, view })

  // if (!Number(pos) || !domNode) return
  // const resolvedPos =
  // console.log({ resolvedPos })
  const pmNode = doc.resolve(pos).node()
  const safeNode = node.node || pmNode

  console.log({ safeNode })

  const classes = isArray(classNames)
    ? classNames
    : classNames?.split(' ') ?? []

  const domClasses = SET(domNode?.className?.split(' ') || [])
  classes.forEach(className => {
    domClasses[method](className)
  })

  const updatedClasses = [...domClasses].join(' ')

  tr.setNodeMarkup(pos, null, {
    ...safeNode.attrs,
    dataset: { id },
    class: updatedClasses,
  })

  view.dispatch(tr)

  AiDesigner.emit('snippets', updatedClasses, AiDesigner.selected)
}
