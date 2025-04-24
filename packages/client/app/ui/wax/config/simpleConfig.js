/* eslint-disable import/no-extraneous-dependencies */
import {
  InlineAnnotationsService,
  BaseService,
  LinkService,
  ListsService,
  SpecialCharactersService,
  DisplayBlockLevelService,
  TextBlockLevelService,
} from 'wax-prosemirror-services'

import { DefaultSchema } from 'wax-prosemirror-core'

export default {
  MenuService: [
    {
      templateArea: 'topBar',
      toolGroups: [
        {
          name: 'Display',
          include: ['Title', 'Heading2', 'Heading3'],
        },
        // 'TextBlock',
        { name: 'Text', include: ['Paragraph'] },
        {
          name: 'Annotations',
          // include: ['Strong', 'Emphasis', 'Link'],
          exclude: [
            'Code',
            'StrikeThrough',
            'Underline',
            'SmallCaps',
            'Superscript',
            'Subscript',
          ],
        },
        {
          name: 'Lists',
          exclude: ['JoinUp', 'Lift', 'BlockQuote'],
        },
      ],
    },
  ],

  SchemaService: DefaultSchema,

  ImageService: { showAlt: true },

  services: [
    new BaseService(),
    new LinkService(),
    new ListsService(),
    new InlineAnnotationsService(),
    new SpecialCharactersService(),
    new DisplayBlockLevelService(),
    new TextBlockLevelService(),
  ],
}
