/* eslint-disable no-restricted-globals */

import { emDash, ellipsis } from 'prosemirror-inputrules'
import { yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror'

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
  ExternalAPIContentService,
} from 'wax-prosemirror-services'

import { TablesService, columnResizing } from 'wax-table-service'

import { EditoriaSchema } from 'wax-prosemirror-core'

import CharactersList from './characterList'
import AiStudioSchema from '../../component-ai-assistant/components/waxSchema'
import addAidctxPlugin from '../../component-ai-assistant/components/addAidCtxPlugin'

// import YjsService from './YjsService'

const { SERVER_URL } = process.env

async function ExternalAPIContentTransformation(prompt) {
  try {
    const response = await fetch(`${SERVER_URL}/api/askChatGpt`, {
      method: 'POST',
      body: new URLSearchParams({ prompt }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return await response.text()
  } catch (e) {
    console.error(e)
    // eslint-disable-next-line no-alert
    alert(
      'That model is currently overloaded with other requests. You can retry your request.',
    )
  } finally {
    /* empty */
  }

  return prompt
}

const config = (yjsProvider, ydoc, docIdentifier) => ({
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
        'ExternalAPIContent',
        'FindAndReplaceTool',
        'FullScreen',
      ],
    },
    {
      templateArea: 'BottomRightInfo',
      toolGroups: ['InfoToolGroup'],
    },
  ],
  ExternalAPIContentService: {
    ExternalAPIContentTransformation,
  },
  SchemaService: AiStudioSchema,
  TitleService: { updateTitle: () => {} },
  SpecialCharactersService: CharactersList,
  RulesService: [emDash, ellipsis],
  ShortCutsService: {},
  CommentsService: {
    showTitle: true,
    getComments: comments => {
      // console.log(comments)
    },
    setComments: () => {
      return true
    },
  },
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

  PmPlugins: [columnResizing(), addAidctxPlugin()],
  services: [
    new ExternalAPIContentService(),
    new YjsService(),
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
  ],
})

export default config
