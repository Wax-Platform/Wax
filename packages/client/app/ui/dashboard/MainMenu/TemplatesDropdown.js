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
  max-width: ${p => (p.$show ? '200px' : '0')};
  pointer-events: ${p => (p.$show ? 'all' : 'none')};
  position: relative;
  transition: max-width 0.3s;
  width: 200px;
`

const TemplatesList = styled(Menu)`
  background: var(--color-trois-lightest-2);
  border-color: var(--color-trois-lightest);
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
  right: -20px;
  top: calc(var(--header-height) - 20px);
  width: 300px;
`

const TemplateItem = styled(MenuItem)`
  align-items: center;
  background: var(--color-trois-lightest-2);
  border-bottom: 1px solid #0001;
  padding: 16px 8px;

  > button {
    color: ${p =>
      p.$selected
        ? 'var(--color-trois-opaque-2)'
        : 'var(--color-trois-opaque)'};
    font-weight: ${p => (p.$selected ? 'bold' : 'normal')};
  }
`

const CurrentTemplateLabel = styled.p`
  color: var(--color-trois-opaque);
  font-size: 14px;
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
  text-align: left;
  width: 100%;
`

const DropdownToggleButton = styled(CleanButton)`
  border-bottom: 1px solid var(--color-trois-lightest);
  display: flex;
  justify-content: space-between;
  width: 100%;
`

export const TemplatesDropdown = props => {
  const { setCss, updatePreview } = useAiDesignerContext()

  const { currentDoc, updateTemplateCss, systemTemplatesData } =
    useDocumentContext()

  const showDropdown = useBool({ start: false })
  const templates = systemTemplatesData?.getUserTemplates || []
  const documentTemplate = currentDoc.template || {}
  const [selectedTemplate, setSelectedTemplate] = useState(documentTemplate)
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.displayName < b.displayName) return -1
    if (a.displayName > b.displayName) return 1
    return 0
  })

  useEffect(() => {
    setSelectedTemplate(currentDoc?.template)
  }, [currentDoc?.template?.displayName])

  const templateItemRender = template => {
    const { rawCss, displayName } = template
    const isSelected = selectedTemplate?.id === template.id

    const forkTemplate = () => {
      const { id } = currentDoc?.template || {}
      const variables = { id, rawCss, displayName }
      setSelectedTemplate(template)
      updateTemplateCss({ variables })
      previewTemplate()
    }

    const previewTemplate = () => {
      setSelectedTemplate(template)
      setCss(rawCss)
      updatePreview(true, rawCss)
      showDropdown.off()
    }

    return (
      <TemplateItem $selected={isSelected}>
        <TemplateButton onClick={previewTemplate}>{displayName}</TemplateButton>
        <FlexRow style={{ gap: '8px' }}>
          <Button onClick={forkTemplate}>
            <ForkOutlined />
          </Button>
        </FlexRow>
      </TemplateItem>
    )
  }

  return (
    <Root {...props}>
      <DropdownToggleButton onClick={showDropdown.toggle}>
        <CurrentTemplateLabel>
          {selectedTemplate?.displayName || currentDoc?.template?.displayName}
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
