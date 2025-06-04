import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import isObject from 'lodash/isObject'
import { Checkbox, Stack } from '../../common'

const Wrapper = styled(Stack)`
  --space: 15px;
`

const ToolGroup = styled.div`
  display: flex;
  flex-flow: column;
`

const ToolName = styled.strong``

const Tool = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  margin-block-start: 8px;
  row-gap: 8px;
`

const inlineAnno = [
  { label: 'Strong', value: 'Strong', checked: true },
  { label: 'Emphasis', value: 'Emphasis', checked: true },
  { label: 'Code', value: 'Code', checked: true },
  { label: 'Link', value: 'LinkTool', checked: true },
  { label: 'Underline', value: 'Underline', checked: true },
  { label: 'Subscript', value: 'Subscript', checked: false },
  { label: 'Superscript', value: 'Superscript', checked: false },
  // { label: 'SmallCaps', value: 'SmallCaps', checked: false },
  { label: 'Strike Through', value: 'StrikeThrough', checked: false },
]

const lists = [
  { label: 'Ordered Lists', value: 'OrderedList', checked: true },
  { label: 'Unordered Lists', value: 'BulletList', checked: true },
  { label: 'BlockQuote', value: 'BlockQuote', checked: true },
  { label: 'Lift Block', value: 'Lift', checked: true },
  { label: 'Join with Above Block', value: 'JoinUp', checked: false },
]

const SingleTools = [
  { label: 'Images', value: 'Images', checked: true },
  { label: 'Special Characters', value: 'SpecialCharacters', checked: true },
  { label: 'Find And Replace', value: 'FindAndReplaceTool', checked: true },
  { label: 'Tables', value: 'Tables', checked: false },
  { label: 'Code Block', value: 'CodeBlock', checked: false },
  { label: 'Text Highlighter', value: 'HighlightToolGroup', checked: false },
  { label: 'Transform Case', value: 'TransformToolGroup', checked: false },
  // { label: 'Track Changes', value: 'TrackingAndEditing', checked: false },
  { label: 'Custom Tags Block', value: 'CustomTagBlock', checked: false },
  { label: 'Custom Tags Inline', value: 'CustomTagInline', checked: false },
  { label: 'Notes', value: 'Notes', checked: false },
  // { label: 'Question Types', value: 'QuestionsDropDown', checked: false },
]

const ConfigurableEditorSettings = ({ savedWaxConfig, saveWaxConfig }) => {
  const [checkedInline, setCheckedInline] = useState(inlineAnno)
  const [checkedLists, setCheckedLists] = useState(lists)
  const [checkedSingleTools, setCheckedSingleTools] = useState(SingleTools)
  const [waxConfig, setWaxConfig] = useState(savedWaxConfig)

  const [waxMenuConfig, setWaxMenuConfig] = useState(
    waxConfig.MenuService[0].toolGroups,
  )

  const onChangeInline = e => {
    setCheckedInline(
      checkedInline.map(item => {
        return item.value === e.target.value
          ? { ...item, checked: !item.checked }
          : item
      }),
    )
  }

  const onChangeLists = e => {
    setCheckedLists(
      checkedLists.map(item => {
        return item.value === e.target.value
          ? { ...item, checked: !item.checked }
          : item
      }),
    )
  }

  const onChangeSingleTool = e => {
    setCheckedSingleTools(
      checkedSingleTools.map(item => {
        return item.value === e.target.value
          ? { ...item, checked: !item.checked }
          : item
      }),
    )
  }

  // create checkbox selection from saved menu
  useEffect(() => {
    waxMenuConfig.find((menuItem, i) => {
      if (menuItem.name === 'Annotations') {
        setCheckedInline(prevState =>
          prevState.map(item =>
            menuItem.exclude.includes(item.value)
              ? { ...item, checked: false }
              : { ...item, checked: true },
          ),
        )
      }

      if (menuItem.name === 'Lists') {
        setCheckedLists(prevState =>
          prevState.map(item =>
            menuItem.exclude.includes(item.value)
              ? { ...item, checked: false }
              : { ...item, checked: true },
          ),
        )
      }

      if (!isObject(menuItem)) {
        setCheckedSingleTools(prevTools =>
          prevTools.map(tool => ({
            ...tool,
            checked: waxMenuConfig.includes(tool.value),
          })),
        )
      }

      return false
    })
  }, [])

  // create Wax menu config everytime a checkbox changes.
  useEffect(() => {
    const excludeSingleTools = checkedSingleTools
      .filter(singleItem => !singleItem.checked)
      .map(singleItem => singleItem.value)

    setWaxMenuConfig(prevConfig =>
      prevConfig.map(menuItem => {
        if (isObject(menuItem) && menuItem.name === 'Annotations') {
          return {
            ...menuItem,
            exclude: checkedInline
              .filter(inlineItem => !inlineItem.checked)
              .map(inlineItem => inlineItem.value),
          }
        }

        if (isObject(menuItem) && menuItem.name === 'Lists') {
          return {
            ...menuItem,
            exclude: checkedLists
              .filter(listItem => !listItem.checked)
              .map(listItem => listItem.value),
          }
        }

        if (!isObject(menuItem)) {
          setWaxMenuConfig(prevWaxConfig => {
            const filteredConfig = prevWaxConfig.filter(
              singleMenuItem => !excludeSingleTools.includes(singleMenuItem),
            )

            const newItems = checkedSingleTools
              .filter(
                tool => tool.checked && !filteredConfig.includes(tool.value),
              )
              .map(tool => tool.value)

            const filteredWithFullScreenLast = [
              ...filteredConfig.filter(item => item !== 'FullScreen'),
              'FullScreen',
            ]

            return [...filteredWithFullScreenLast, ...newItems]
          })
        }

        return menuItem
      }),
    )

    setWaxConfig({
      ...waxConfig,
      MenuService: waxConfig.MenuService.map(service => {
        if (service?.templateArea === 'mainMenuToolBar') {
          return {
            ...service,
            toolGroups: waxMenuConfig,
          }
        }

        return service
      }),
    })
  }, [
    checkedInline,
    checkedLists,
    checkedSingleTools,
    JSON.stringify(waxMenuConfig),
  ])

  // save to settings modal
  saveWaxConfig(waxConfig)

  return (
    <Wrapper>
      <ToolGroup vertical>
        <ToolName>Inline Annotations</ToolName>
        <Tool>
          {checkedInline.map(anno => {
            return (
              <Checkbox
                checked={anno.checked}
                key={anno.label}
                onChange={onChangeInline}
                value={anno.value}
              >
                {anno.label}
              </Checkbox>
            )
          })}
        </Tool>
      </ToolGroup>
      <ToolGroup vertical>
        <ToolName>Lists &amp; Blockquote</ToolName>
        <Tool>
          {checkedLists.map(listTool => {
            return (
              <Checkbox
                checked={listTool.checked}
                key={listTool.label}
                onChange={onChangeLists}
                value={listTool.value}
              >
                {listTool.label}
              </Checkbox>
            )
          })}
        </Tool>
      </ToolGroup>
      <ToolGroup vertical>
        <ToolName>Other tools</ToolName>
        <Tool>
          {checkedSingleTools.map(singleTool => {
            return (
              <Checkbox
                checked={singleTool.checked}
                key={singleTool.label}
                onChange={onChangeSingleTool}
                value={singleTool.value}
              >
                {singleTool.label}
              </Checkbox>
            )
          })}
        </Tool>
      </ToolGroup>
    </Wrapper>
  )
}

ConfigurableEditorSettings.propTypes = {
  savedWaxConfig: PropTypes.shape().isRequired,
  saveWaxConfig: PropTypes.func.isRequired,
}

export default ConfigurableEditorSettings
