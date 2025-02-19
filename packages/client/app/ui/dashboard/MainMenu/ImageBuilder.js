/* stylelint-disable declaration-no-important */
import React, { useState } from 'react'
import { CleanButton, FlexCol, FlexRow } from '../../_styleds/common'
import {
  IMG_GEN_PARAMS,
  useAiDesignerContext,
} from '../../component-ai-assistant/hooks/AiDesignerContext'
import Each from '../../component-ai-assistant/utils/Each'
import styled from 'styled-components'
import { Menu, MenuItem, MenuButton, SubMenu } from '../../common/ContextMenu'
import { safeCall } from '../../../shared/generalUtils'
import { useBool } from '../../../hooks/dataTypeHooks'
import ChatHistory from '../../component-ai-assistant/ChatHistory'

const Grid = styled.div`
  display: grid;
  gap: 0;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
`

const DropdownButtonContainer = styled(FlexRow)`
  color: var(--color-trois-opaque);
  gap: 5px;
  position: relative;
  width: 100%;
`

const StyledMenuButton = styled(MenuButton)`
  background: none;
  border: none;
  color: var(--color-trois-opaque);
  cursor: pointer;
  display: flex;
  font-size: 12px !important;
  gap: 5px;
  padding: 5px 10px;
  width: 100%;
`

const DropdownButton = ({ label, items }) => {
  const [showMenu, setShowMenu] = useState(false)
  const toggleMenu = () => setShowMenu(!showMenu)
  const hideMenu = () => setShowMenu(false)

  return (
    <DropdownButtonContainer>
      <StyledMenuButton
        style={{
          backgroundColor: 'var(--color-trois-lightest)',
          width: '100%',
        }}
        onClick={toggleMenu}
      >
        {label}
      </StyledMenuButton>
      {showMenu && (
        <Menu
          x={0}
          y={0}
          visible={showMenu}
          shouldAnimate={true}
          style={{ marginTop: '20px' }}
        >
          <Each
            of={items}
            as={item => <OptionRender {...{ ...item, onClose: hideMenu }} />}
            if={items?.length}
          />
        </Menu>
      )}
    </DropdownButtonContainer>
  )
}

const OptionRender = item => {
  const { action, label, disabled, items, ...props } = item
  const submenu = useBool({ start: false })
  console.log

  const handleAction = e => {
    safeCall(action)(e)
    safeCall(item.onClose)()
  }

  return label === '-' ? (
    <hr key={label}></hr>
  ) : (
    <MenuItem
      key={label}
      onMouseEnter={submenu.on}
      onMouseLeave={submenu.off}
      visible={submenu.state}
      style={{ width: '100%' }}
      {...props}
    >
      <StyledMenuButton $disabled={disabled} onClick={handleAction}>
        <span>{label}</span>
      </StyledMenuButton>
      {/* {items && (
        <SubMenu data-contextmenu visible={submenu.state}>
          {items.map(opt => (
            <MenuItem key={opt.label}>
              <MenuButton onClick={opt.action}>{opt.label}</MenuButton>
            </MenuItem>
          ))}
        </SubMenu>
      )} */}
    </MenuItem>
  )
}

export default DropdownButton

export const ImageBuilderHeader = () => {
  const { imgGenParams, setImgGenParams } = useAiDesignerContext()

  return (
    <FlexCol style={{ width: '100%', gap: '2px' }}>
      <Each
        of={Object.entries(IMG_GEN_PARAMS)}
        as={([param, values]) => {
          const options = values.map(value => ({
            label: value,
            action: () => setImgGenParams(p => ({ ...p, [param]: value })),
          }))

          return (
            <FlexRow key={param} style={{ width: '100%' }}>
              <span style={{ width: '4dvw', textTransform: 'uppercase' }}>
                {param}
              </span>
              <DropdownButton
                label={imgGenParams[param] || 'Select'}
                items={options}
              />
            </FlexRow>
          )
        }}
        if={Object.keys(IMG_GEN_PARAMS).length}
      />
    </FlexCol>
  )
}

export const ImageBuilder = () => {
  return (
    <FlexRow style={{ paddingBlock: '10px' }}>
      <ChatHistory />
    </FlexRow>
  )
}

const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100dvh - (var(--header-height) + var(--menu-height, 0px)));

  opacity: ${p => (p.$show ? '1' : '0')};

  overflow: hidden;
  position: relative;
  transition: all 0.3s linear;
  width: ${p => (p.$show ? '100%' : '0')};
`

const EditorScroll = styled.div`
  display: flex;
  margin: 0;
  overflow: scroll;
  position: relative;
  scroll-behavior: smooth;
  width: 100%;
`

const Header = styled(FlexRow)`
  align-items: center;
  border-bottom: 1px solid var(--color-trois-lightest);
  justify-content: space-between;
  padding: 13px 20px;

  h3 {
    color: var(--color-trois-opaque);
    margin: 0;
  }
`

export const FullCodeEditor = ({ code, config }) => {
  const [localCode, setLocalCode] = useState(code)
  const { updateTemplateCss, templateToEdit, setTemplateToEdit } =
    useDocumentContext()

  const [getTemplate, { data: templateData }] = useLazyQuery(GET_TEMPLATE)
  useEffect(() => {
    if (templateToEdit) {
      getTemplate({
        variables: {
          id: templateToEdit,
        },
      })
    }
  }, [templateToEdit])

  useEffect(() => {
    if (templateData?.getTemplate?.rawCss) {
      setLocalCode(templateData.getTemplate.rawCss)
    }
  }, [templateData])

  return (
    <StyledWindow $show={userMenu.state.images}>
      <Header>
        <h3></h3>
        <FlexRow style={{ gap: '8px', alignItems: 'center' }}>
          <Actions></Actions>
          <Actions>
            <CleanButton onClick={() => setTemplateToEdit(null)}>
              <CloseOutlined style={{ pointerEvents: 'none' }} />
            </CleanButton>
          </Actions>
        </FlexRow>
      </Header>
      <EditorScroll></EditorScroll>
    </StyledWindow>
  )
}
