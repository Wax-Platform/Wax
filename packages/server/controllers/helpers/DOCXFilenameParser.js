const DOCXFilenameParser = fileName => {
  const nameSpecifier = fileName.slice(0, 1)

  let label

  if (nameSpecifier === 'a') {
    label = 'Frontmatter'
  } else if (nameSpecifier === 'w') {
    label = 'Backmatter'
  } else {
    label = 'Body'
  }

  let componentType

  if (label !== 'Body') {
    componentType = 'component'
  } else if (fileName.includes('00')) {
    componentType = 'unnumbered'
  } else if (fileName.includes('pt0')) {
    componentType = 'part'
  } else {
    componentType = 'chapter'
  }

  return {
    label,
    componentType,
  }
}

module.exports = DOCXFilenameParser
