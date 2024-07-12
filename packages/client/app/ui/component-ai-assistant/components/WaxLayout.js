/* eslint-disable react/prop-types */
import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { ComponentPlugin, WaxContext, WaxView } from 'wax-prosemirror-core'
// import { values } from 'lodash'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import { parseContent } from '../utils'

const LayoutWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;

  &[data-selection-enabled='true'] {
    > * > * {
      cursor: pointer;
    }
  }
`

const EditorWrapper = styled.div`
  height: fit-content;
  background: var(--color-background, #fff);
  border: 2px solid rgba(5, 5, 5, 0.06);
  padding: 41px 90px;
  min-height: 100vh;
  max-height: 100%;
  overflow: auto;
`

const ToolbarContainer = styled.div`
  left: 0;
  width: 100%;
  display: flex;
  background: #fff;
  > div:first-child {
    > :is(button) {
      block-size: 20px;
      inline-size: 20px;

      &::before {
        font-weight: 700;
      }

      &:nth-child(1)::before {
        content: 'H1';
      }

      &:nth-child(2)::before {
        content: 'H2';
      }

      &:nth-child(3)::before {
        content: 'H3';
      }

      span {
        display: none;
      }
    }
  }
`

const SimpleToolBar = ComponentPlugin('topBar')

const WaxLayout = ({ className, ...props }) => {
  const {
    htmlSrc,
    setSelectedCtx,
    getCtxBy,
    setWaxContext,
    // tools,
    settings: {
      editor: { enableSelection },
    },
  } = useContext(AiDesignerContext)

  const waxCtx = useContext(WaxContext)

  useEffect(() => {
    setWaxContext(waxCtx)
  }, [])

  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        height: 'fit-content',
      }}
    >
      <ToolbarContainer>
        <SimpleToolBar />
      </ToolbarContainer>
      <LayoutWrapper
        className={className}
        data-selection-enabled={enableSelection}
        // data-selection-enabled={
        //   values(tools).every(v => v.active === false) && enableSelection
        // }
        id="wax-container"
        onClick={({ target }) => {
          if (htmlSrc.contains(target)) return
          setSelectedCtx(getCtxBy({ node: htmlSrc }))
        }}
      >
        <EditorWrapper>
          <WaxView {...props} />
        </EditorWrapper>
      </LayoutWrapper>
    </span>
  )
}

export default WaxLayout
