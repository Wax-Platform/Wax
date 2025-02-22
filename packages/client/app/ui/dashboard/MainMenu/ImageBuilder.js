/* stylelint-disable declaration-no-important */
import React, { useEffect, useState } from 'react'
import { CleanButton, FlexCol, FlexRow } from '../../_styleds/common'
import {
  IMG_GEN_PARAMS,
  useAiDesignerContext,
} from '../../component-ai-assistant/hooks/AiDesignerContext'
import Each from '../../component-ai-assistant/utils/Each'
import styled from 'styled-components'
import { Menu, MenuItem, MenuButton, SubMenu } from '../../common/ContextMenu'
import { safeCall } from '../../../shared/generalUtils'
import { useBool, useFlags } from '../../../hooks/dataTypeHooks'
import ChatHistory from '../../component-ai-assistant/ChatHistory'
import { useDocumentContext } from '../hooks/DocumentContext'
import { CloudUploadOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'

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

const HiddenInput = styled.input`
  display: none;
`

const StyledLabel = styled.label`
  cursor: pointer;
  display: flex;
`

const FileUpload = ({ onFileSelect }) => {
  const handleFileChange = event => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result
        const title = file.name
        onFileSelect({ base64, title })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div>
      <HiddenInput
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        accept="image/*"
      />
      <StyledLabel htmlFor="file-upload" title="Upload file">
        <CloudUploadOutlined style={{ fontSize: '16px' }} />
      </StyledLabel>
    </div>
  )
}

export const FileUploadContainer = () => {
  const { graphQL, currentFolder } = useDocumentContext()
  const handleFileSelect = ({ base64, title }) => {
    graphQL.addResource({
      variables: {
        id: currentFolder?.id,
        base64,
        title,
        resourceType: 'image',
        extension: 'img',
      },
    })
  }

  return <FileUpload onFileSelect={handleFileSelect} accept="image/*" />
}
const INIT_FLAGS = {
  menu: false,
  visible: false,
  transitioning: false,
}

const DropdownButton = ({ label, items }) => {
  const menuFlags = useFlags({
    start: INIT_FLAGS,
    onMenuUpdate: m =>
      m
        ? menuFlags.update({ visible: true })
        : debounce(menuFlags.update, 300)({ visible: false, animating: false }),
  })

  const { menu, visible, animating } = menuFlags.state

  const toggleMenu = () => menuFlags.update({ menu: !menu, animating: true })
  const hideMenu = () => menuFlags.update({ menu: false, animating: false })

  useEffect(() => {
    const handleClickOutside = e => {
      if (!e.target.closest('[data-dropdown]')) {
        hideMenu()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const shouldAnimate = visible && animating

  return (
    <DropdownButtonContainer>
      <MenuButton
        data-dropdown
        style={{
          backgroundColor: 'var(--color-trois-lightest)',
          width: '100%',
        }}
        onClick={toggleMenu}
      >
        {label}
      </MenuButton>
      {visible && (
        <Menu
          data-dropdown
          x={0}
          y={0}
          visible={menu}
          shouldAnimate={shouldAnimate}
          style={{
            marginTop: '25px',
            width: '100%',
            borderRadius: '0 0 8px 8px',
            maxHeight: '200px',
            overflowY: 'auto',
            f,
          }}
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

  const handleAction = e => {
    safeCall(action)(e)
    safeCall(item.onClose)()
  }

  return (
    <FlexRow style={{ width: '100%' }}>
      {label === '-' ? (
        <hr key={label}></hr>
      ) : (
        <MenuItem
          key={label}
          onMouseEnter={submenu.on}
          onMouseLeave={submenu.off}
          visible={submenu.state}
          style={{
            width: '100%',
            borderBottom: '1px solid var(--color-trois-alpha)',
            padding: '4px 8px',
            height: 'fit-content',
          }}
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
      )}
    </FlexRow>
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
