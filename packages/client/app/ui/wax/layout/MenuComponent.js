/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */

/* stylelint-disable declaration-no-important */

import React, { useContext, forwardRef, useMemo, useCallback } from 'react'
import { th } from '@coko/client'
import { WaxContext, ApplicationContext } from 'wax-prosemirror-core'
import styled from 'styled-components'
import BlockDropDownComponent from './BlockDropDownComponent'

const Menu = styled.div`
  background: white;
  display: flex;
  flex-wrap: wrap;
  font-family: ${th('fontInterface')};
  font-size: 16px;
  height: ${props => (props.openMenu === true ? '100%' : '40px')};
  overflow: hidden;
  width: 100%;

  > div:last-child {
    border: none;
    margin-left: ${props =>
      props.openMenu === true ? 'unset !important' : 'auto'};
  }
`

const MenuToolGroup = styled.div`
  align-items: center;
  border-right: 1px solid;
  display: flex;
  height: ${props => (props.openMenu === true ? '100%' : '40px')};
  padding: 0 4px;

  button {
    margin: 0 5px;
  }

  .Dropdown-menu {
    margin-left: -40px;
    margin-top: 40px;
    position: fixed;
    top: unset;
    width: 200px;
  }

  .Dropdown-control {
    margin-left: unset !important;
  }

  @media screen and (min-width: 1050px) {
    height: 40px;
  }
`

const MenuToolGroupDropDown = styled(MenuToolGroup)`
  min-width: 150px;
`

const MenuToolSearchAndReplace = styled(MenuToolGroup)`
  flex-grow: ${props => (props.open ? 'unset' : '1')};

  div:first-child {
    z-index: 1;
  }
`

const MenuLines = styled.div`
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: ${props => (props.fullScreen ? 0 : 132)}px;
`

const MenuLine = styled.div`
  box-shadow: 0 1px 0 0.2px #efefef;
  box-sizing: border-box;
  height: 40px;
`

const MenuComponent = forwardRef(({ open, fullScreen }, ref) => {
  const { activeView } = useContext(WaxContext)
  const { app } = useContext(ApplicationContext)
  const Base = app.container.get('Base')
  const DropDownTools = app.container.get('BlockDropDown')
  const Annotations = app.container.get('Annotations')
  const HighlightToolGroup = app.container.get('HighlightToolGroup')
  const TransformToolGroup = app.container.get('TransformToolGroup')
  const Lists = app.container.get('Lists')
  const BlockQuote = app.container.get('BlockQuoteTool')
  const Images = app.container.get('Images')
  const SpecialCharacters = app.container.get('SpecialCharacters')
  const Tables = app.container.get('Tables')
  const ExternalAPIContent = app.container.get('ExternalAPIContent')
  const FindAndReplaceTool = app.container.get('FindAndReplaceTool')
  const FullScreen = app.container.get('FullScreen')

  let Lines = []

  useCallback(() => {
    if (ref.current) {
      Lines = Array.from(
        { length: Math.round(ref.current.clientHeight / 40) },
        (_, i) => <MenuLine key={`${i}-line`} />,
      )
    }
  }, [Lines])

  const FindAndReplaceComponent = useMemo(() => {
    return (
      <MenuToolSearchAndReplace open={open}>
        {FindAndReplaceTool._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolSearchAndReplace>
    )
  }, [open])

  return (
    <Menu openMenu={open} ref={ref}>
      <MenuToolGroup>
        {Base._tools
          .filter(tool => tool.name !== 'Save')
          .map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroupDropDown>
        <BlockDropDownComponent
          tools={DropDownTools._tools}
          view={activeView}
        />
      </MenuToolGroupDropDown>
      <MenuToolGroup>
        {Annotations._tools
          .filter(tool => tool.name !== 'Code')
          .map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroup>
        {HighlightToolGroup._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroup>
        {TransformToolGroup._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroup>
        {Lists._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroup>
        {BlockQuote._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroup>
        {Images._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroup>
        {SpecialCharacters._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroup>
        {Tables._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      <MenuToolGroup>
        {ExternalAPIContent._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      {FindAndReplaceComponent}
      <MenuToolGroup>
        {FullScreen._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      {open && (
        <MenuLines fullScreen={fullScreen}>{Lines.map(Line => Line)}</MenuLines>
      )}
    </Menu>
  )
})

export default MenuComponent