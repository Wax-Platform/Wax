import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useBool } from '../../../hooks/dataTypeHooks'
import { CleanButton, FlexRow } from '../../_styleds/common'
import { DownOutlined, EyeOutlined, ForkOutlined } from '@ant-design/icons'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { useDocumentContext } from '../hooks/DocumentContext'
import Each from '../../component-ai-assistant/utils/Each'
import { Menu, MenuButton, MenuItem } from '../../common/ContextMenu'

const Root = styled.div`
  --dropdown-h: 300px;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
  position: relative;
  transition: max-width 0.3s;
  width: fit-content;
`

const TemplatesList = styled(Menu)`
  background: var(--color-trois-lightest-2);
  border: 3px solid var(--color-trois-lightest);
  border-top: none;
  box-shadow: 0 0 10px 0 #0000;
  display: flex;
  flex-direction: column;
  height: var(--dropdown-h);
  list-style: none;
  margin: 0;
  max-width: 300px;
  opacity: 1;
  overflow-y: auto;
  padding: 0;
  right: -21px;
  top: calc(var(--header-height) - 29px);
  width: 300px;
  z-index: 9;
`

const TemplateItem = styled(MenuItem)`
  --item-height: 32px;
  align-items: center;
  background: var(--color-trois-lightest-2);
  border-bottom: 1px solid #0001;
  height: var(--item-height);
  padding: 16px 11px 16px 8px;

  p {
    font-size: 12px;
    margin: 0;
  }

  > button {
    color: ${p =>
      p.$selected
        ? 'var(--color-trois-opaque-2)'
        : 'var(--color-trois-opaque)'};
    font-weight: ${p => (p.$selected ? 'bold' : 'normal')};

    svg {
      fill: ${p =>
        p.$selected ? 'var(--color-trois-opaque-2)' : 'var(--color-trois)'};
    }
  }

  .anticon svg {
    fill: var(--color-trois-opaque);
    height: 12px;
    width: 12px;
  }
`

const CurrentTemplateLabel = styled.p`
  color: var(--color-trois-opaque-2);
  font-size: 10px;
  margin: 0;
  padding: 0 8px;
  white-space: nowrap;
  width: 100%;
`
const Button = styled(MenuButton)`
  width: fit-content;
`
const TemplateButton = styled(CleanButton)`
  color: var(--color-trois-opaque);
  font-size: 13px;
  height: 32px;
  padding: 0 8px;
  text-align: left;
  width: 100%;
`

const DropdownToggleButton = styled(CleanButton)`
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 0;
  width: fit-content;

  .anticon svg {
    height: 8px;
    transform: ${p => (p.$open ? 'scaleY(-1)' : 'scaleY(1)')};
    transition: transform 0.3s;
    width: 8px;
  }
`

export const TemplatesDropdown = props => {
  const { setCss, updatePreview } = useAiDesignerContext()

  const {
    updateCurrentDocTemplate,
    systemTemplatesData,
    selectedTemplate,
    setSelectedTemplate,
  } = useDocumentContext()

  const showDropdown = useBool({ start: false })
  const templates = systemTemplatesData?.getUserTemplates || []
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.displayName < b.displayName) return -1
    if (a.displayName > b.displayName) return 1
    return 0
  })

  const templateItemRender = template => {
    const { rawCss, displayName } = template
    const isSelected = selectedTemplate?.id === template.id

    const forkTemplate = () => {
      const { id } = template
      setCss(rawCss)
      updateCurrentDocTemplate(id)
      setSelectedTemplate(template)
      updatePreview(true, rawCss)
      showDropdown.off()
    }

    return (
      <TemplateItem $selected={isSelected}>
        <TemplateButton onClick={forkTemplate}>
          <p>{displayName}</p>
        </TemplateButton>
        <FlexRow style={{ gap: '8px' }}>
          <ForkOutlined />
        </FlexRow>
      </TemplateItem>
    )
  }

  return (
    <Root {...props}>
      <DropdownToggleButton
        onClick={showDropdown.toggle}
        $open={showDropdown.state}
      >
        <CurrentTemplateLabel>
          {selectedTemplate?.displayName}
        </CurrentTemplateLabel>
        <DownOutlined />
      </DropdownToggleButton>
      <TemplatesList
        visible={showDropdown.state}
        onMouseLeave={showDropdown.off}
      >
        <Each
          of={sortedTemplates}
          as={templateItemRender}
          if={sortedTemplates.length}
        />
      </TemplatesList>
    </Root>
  )
}
