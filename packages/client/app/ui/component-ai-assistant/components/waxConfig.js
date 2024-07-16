import {
  InlineAnnotationsService,
  LinkService,
  ListsService,
  MathService,
  SpecialCharactersService,
  DisplayBlockLevelService,
  TextBlockLevelService,
  BlockDropDownToolGroupService,
} from 'wax-prosemirror-services'

import AiStudioSchema from './waxSchema'
import addAidctxPlugin from '../../wax/pmPlugins/addAidCtxPlugin'

const SchemaService = AiStudioSchema()
const waxConfig = {
  MenuService: [
    {
      templateArea: 'topBar',
      toolGroups: [
        {
          name: 'Display',
          include: ['Title', 'Heading2', 'Heading3'],
        },
        {
          name: 'Text',
          include: ['Paragraph'],
        },
        {
          name: 'Annotations',
        },
        {
          name: 'Lists',
          exclude: ['JoinUp', 'Lift'],
        },
      ],
    },
  ],

  SchemaService,

  // ImageService: { showAlt: true },

  services: [
    new LinkService(),
    new ListsService(),
    new InlineAnnotationsService(),
    new MathService(),
    new SpecialCharactersService(),
    new DisplayBlockLevelService(),
    new TextBlockLevelService(),
    new BlockDropDownToolGroupService(),
  ],

  PmPlugins: [addAidctxPlugin()],
}

export default waxConfig
