import { DefaultSchema } from 'wax-prosemirror-core'

import {
  InlineAnnotationsService,
  ImageService,
  LinkService,
  ListsService,
  BaseService,
  DisplayBlockLevelService,
  TextBlockLevelService,
  SpecialCharactersService,
  BlockDropDownToolGroupService,
  FindAndReplaceService,
  // FindAndReplaceToolGroupService,
  FullScreenService,
  // disallowPasteImagesPlugin,
  CommentsService,
} from 'wax-prosemirror-services'

import { TablesService, tableEditing } from 'wax-table-service'

import disallowPasteImagesPlugin from '../disallowPasteImagesPlugin'

import charactersList from './charactersList'

import { onInfoModal } from '../../../helpers/commonModals'

import YjsService from './YjsService'

const config = {
  MenuService: [
    {
      templateArea: 'mainMenuToolBar',
      toolGroups: [
        { name: 'Base', exclude: ['Save'] },
        'BlockDropDown',
        // { name: 'BlockQuoteTool', exclude: ['Lift'] },l
        { name: 'Lists', exclude: ['JoinUp'] },
        // {
        //   name: 'Text',
        //   exclude: [
        //     'ExtractPoetry',
        //     'ExtractProse',
        //     'ParagraphContinued',
        //     'Subscript',
        //     'SourceNote',
        //     'Paragraph',
        //   ],
        // },
        'Images',
        {
          name: 'Annotations',
          exclude: ['SmallCaps', 'StrikeThrough', 'Subscript', 'Superscript'],
        },
        // 'Tables',
        'SpecialCharacters',
        'FindAndReplaceTool',
        'FullScreen',
      ],
    },
  ],

  SchemaService: DefaultSchema,
  SpecialCharactersService: charactersList,
  PmPlugins: [
    tableEditing(),
    disallowPasteImagesPlugin(() => {
      if (!window.showInfo) {
        window.showInfo = true
        onInfoModal(
          `Pasting external images is not supported. Please upload an image file by selecting the image icon in the toolbar.`,
        )
        setTimeout(() => {
          window.showInfo = false
        }, 500)
      }
    }),
  ],

  services: [
    new YjsService(),
    new CommentsService(),
    new InlineAnnotationsService(),
    new ImageService(),
    new LinkService(),
    new ListsService(),
    new BaseService(),
    new TablesService(),
    new DisplayBlockLevelService(),
    new TextBlockLevelService(),
    new SpecialCharactersService(),
    new BlockDropDownToolGroupService(),
    new FindAndReplaceService(),
    // new FindAndReplaceToolGroupService(),
    new FullScreenService(),
  ],
}

export default config
