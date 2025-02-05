import { capitalize } from 'lodash'
import React, { Fragment } from 'react'
import { objIf } from '../../../../shared/generalUtils'

export const typeFlags = (type, title) => ({
  isRoot: type === 'root',
  isFolder: type === 'dir',
  isSystem: type === 'sys',
  isDoc: type === 'doc',
  isSnippet: type === 'snip',
  isTemplate: type === 'template',
  ...objIf(type === 'sys' && title, {
    isFavorites: title === 'Favorites',
    isDocuments: title === 'Documents',
    isImages: title === 'Images',
    isShared: title === 'Shared',
    isTemplates: title === 'Templates',
    isBooks: title === 'Books',
  }),
})

export const labelRender = (icon, text) => (
  <Fragment>
    {icon}
    <span>{capitalize(text)}</span>
  </Fragment>
)
