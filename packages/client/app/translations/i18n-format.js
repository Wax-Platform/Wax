// eslint-disable-next-line no-shadow
function format(value, format, lng) {
  if (format.startsWith('date')) {
    return formatDate(value, format, lng)
  }

  if (format.startsWith('number')) {
    return formatNumber(value, format, lng)
  }

  return value
}

// eslint-disable-next-line no-shadow
function formatDate(value, format, lng) {
  const options = toOptions(format, 'date')

  return options === null
    ? value
    : new Intl.DateTimeFormat(lng, options).format(value)
}

// eslint-disable-next-line no-shadow
function formatNumber(value, format, lng) {
  const options = toOptions(format, 'number')

  return options === null
    ? value
    : new Intl.NumberFormat(lng, options).format(value)
}

// eslint-disable-next-line no-shadow
function toOptions(format, specifier) {
  if (format.trim() === specifier) {
    return {}
  }

  try {
    return JSON.parse(toJsonString(format, specifier))
  } catch (error) {
    console.error(error)

    return null
  }
}

// eslint-disable-next-line no-shadow
function toJsonString(format, specifier) {
  const inner = format
    .trim()
    .replace(specifier, '')
    .replace('(', '')
    .replace(')', '')
    .split(';')
    .map(param =>
      param
        .split(':')
        .map(name => `"${name.trim()}"`)
        .join(':'),
    )
    .join(',')

  return `{${inner}}`
}

export default format
