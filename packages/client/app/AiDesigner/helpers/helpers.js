export const allInDom = () =>
  [...document.querySelectorAll('[data-aidctx]')]
    .map(n => n?.dataset?.aidctx)
    .filter(Boolean)

export const updateObjectFromKey = (obj, setting, value) => {
  const temp = { ...prev }
  temp[setting] = { ...(temp[setting] || {}), ...value }
  return temp
}
export const validate = (src, input) => {
  const newSrc = src
  const validValues = {}
  onEntries(
    src,
    (k, v) => valueToCheck =>
      (validValues[k] = typeof valueToCheck === typeof v),
  )
  onEntries(input, (k, v) => {
    if (input[k] && validValues[k](v)) newSrc[k] = v
  })
  return newSrc
}
