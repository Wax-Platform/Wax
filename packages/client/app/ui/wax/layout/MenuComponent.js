/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */

/* stylelint-disable declaration-no-important */

import React, { useContext, forwardRef, useMemo, useCallback } from 'react'
import { th } from '@coko/client'
import { WaxContext, ApplicationContext } from 'wax-prosemirror-core'
import styled from 'styled-components'
import BlockDropDownComponent from './BlockDropDownComponent'
import { FlexRow } from '../../_styleds/common'
import JitsiMeetLink from '../../component-ai-assistant/components/JitsiMeetLink'

const Menu = styled(FlexRow)`
  background: var(--color-trois-lightest);
  border-radius: 1.5rem;
  font-family: ${th('fontInterface')};
  font-size: 14px;
  height: fit-content;
  opacity: ${p => (p.openMenu ? '1' : '0')};
  overflow: ${p => (p.openMenu ? 'visible' : 'hidden')};
  padding: 7px 8px;
  transition: all 0.2s linear;
  width: 100%;
  z-index: 9999;

  > * {
    border-color: var(--color-trois-light) !important;
  }

  > div:last-child {
    border: none;
    margin-left: ${p => (p.openMenu ? 'unset !important' : 'auto')};
  }
`

const MenuToolGroup = styled.div`
  align-items: center;
  border-right: 1px solid;
  display: flex;
  height: 30px;
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
    height: 26px;
  }
`

const MenuToolGroupDropDown = styled(MenuToolGroup)`
  min-width: 150px;
`

const MenuToolSearchAndReplace = styled(MenuToolGroup)`
  flex-grow: ${p => (p.open ? 'unset' : '1')};

  div:first-child {
    z-index: 1;
  }
`

// const MenuLines = styled.div`
//   left: 0;
//   pointer-events: none;
//   position: absolute;
//   right: 0;
//   top: ${p => (p.fullScreen ? 0 : 132)}px;
// `

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
  // const Images = app.container.get('Images')
  const SpecialCharacters = app.container.get('SpecialCharacters')
  const Tables = app.container.get('Tables')
  // const ExternalAPIContent = app.container.get('ExternalAPIContent')
  const FindAndReplaceTool = app.container.get('FindAndReplaceTool')
  const FullScreen = app.container.get('FullScreen')

  // let Lines = []

  // useCallback(() => {
  //   if (ref.current) {
  //     Lines = Array.from(
  //       { length: Math.round(ref.current.clientHeight / 40) },
  //       (_, i) => <MenuLine key={`${i}-line`} />,
  //     )
  //   }
  // }, [Lines])

  const FindAndReplaceComponent = useMemo(() => {
    return (
      <MenuToolSearchAndReplace open={open}>
        {FindAndReplaceTool._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolSearchAndReplace>
    )
  }, [open])

  return (
    <Menu openMenu={open} ref={ref}>
      <FlexRow>
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
        {/* <MenuToolGroup>
        {BlockQuote._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup> */}
        {/* <MenuToolGroup>
        {Images._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup> */}
        <MenuToolGroup>
          {SpecialCharacters._tools.map(tool => tool.renderTool(activeView))}
        </MenuToolGroup>
        <MenuToolGroup>
          {Tables._tools.map(tool => tool.renderTool(activeView))}
        </MenuToolGroup>
        {/* <MenuToolGroup>
          {ExternalAPIContent._tools.map(tool => tool.renderTool(activeView))}
        </MenuToolGroup> */}
        {FindAndReplaceComponent}
        <JitsiMeetLink />
      </FlexRow>
      <MenuToolGroup>
        {FullScreen._tools.map(tool => tool.renderTool(activeView))}
      </MenuToolGroup>
      {/* {open && (
        <MenuLines fullScreen={fullScreen}>{Lines.map(Line => Line)}</MenuLines>
      )} */}
    </Menu>
  )
})

export default MenuComponent
