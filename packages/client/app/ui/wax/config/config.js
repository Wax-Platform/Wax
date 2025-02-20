/* eslint-disable no-restricted-globals */

import { emDash, ellipsis } from 'prosemirror-inputrules'

import {
  InlineAnnotationsService,
  BaseService,
  CommentsService,
  ImageService,
  LinkService,
  ListsService,
  DisplayBlockLevelService,
  TextBlockLevelService,
  DisplayTextToolGroupService,
  MathService,
  FindAndReplaceService,
  FullScreenService,
  SpecialCharactersService,
  HighlightService,
  BottomInfoService,
  TransformService,
  CustomTagService,
  BlockDropDownToolGroupService,
  YjsService,
} from 'wax-prosemirror-services'

import { TablesService, columnResizing } from 'wax-table-service'

import CharactersList from './characterList'
import AiStudioSchema from '../../component-ai-assistant/components/waxSchema'
import AidCtxService from '../Services/AidCtxService'
import { arrIf, objIf } from '../../../shared/generalUtils'

const config = (yjsProvider, ydoc, docIdentifier) => {
  const noYjs = !yjsProvider || !ydoc || !docIdentifier

  return {
    MenuService: [
      {
        templateArea: 'mainMenuToolBar',
        toolGroups: [
          {
            name: 'Base',
            exclude: ['Save'],
          },
          {
            name: 'BlockDropDown',
            exclude: [
              'Author',
              'SubTitle',
              'EpigraphProse',
              'EpigraphPoetry',
              'Heading4',
              'ParagraphContinued',
              'ExtractProse',
              'SourceNote',
            ],
          },
          {
            name: 'Annotations',
            more: ['Superscript', 'Subscript', 'SmallCaps'],
            exclude: ['Code'],
          },
          'HighlightToolGroup',
          'TransformToolGroup',
          'Lists',
          'Images',
          'SpecialCharacters',
          'Tables',
          'FindAndReplaceTool',
          'FullScreen',
        ],
      },
      {
        templateArea: 'BottomRightInfo',
        toolGroups: ['InfoToolGroup'],
      },
    ],
    SchemaService: AiStudioSchema,
    SpecialCharactersService: CharactersList,
    RulesService: [emDash, ellipsis],
    ShortCutsService: {},
    CommentsService: {
      showTitle: true,
      getComments: comments => {},
      setComments: () => {
        return true
      },
    },
    ...objIf(!noYjs, {
      YjsService: {
        provider: () => {
          return yjsProvider
        },
        ydoc: () => {
          return ydoc
        },
        docIdentifier,
        cursorBuilder: user => {
          const cursor = document.createElement('span')
          cursor.classList.add('ProseMirror-yjs-cursor')
          cursor.setAttribute('style', `border-color: ${user.color}`)
          const userDiv = document.createElement('div')
          userDiv.setAttribute('style', `background-color: ${user.color}`)
          userDiv.insertBefore(document.createTextNode(user.displayName), null)
          cursor.insertBefore(userDiv, null)
          return cursor
        },
      },
    }),

    PmPlugins: [columnResizing()],
    services: [
      ...arrIf(!noYjs, new YjsService()),
      new BaseService(),
      new BlockDropDownToolGroupService(),
      new CommentsService(),
      new DisplayBlockLevelService(),
      new TextBlockLevelService(),
      new ListsService(),
      new LinkService(),
      new InlineAnnotationsService(),
      new ImageService(),
      new TablesService(),
      new MathService(),
      new FindAndReplaceService(),
      new FullScreenService(),
      new DisplayTextToolGroupService(),
      new SpecialCharactersService(),
      new HighlightService(),
      new BottomInfoService(),
      new TransformService(),
      new CustomTagService(),
      new AidCtxService(),
    ],
  }
}

export default config
