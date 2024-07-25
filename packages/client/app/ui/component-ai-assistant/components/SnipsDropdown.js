/* stylelint-disable indentation */
/* stylelint-disable no-descending-specificity */
import { capitalize, debounce, isString } from 'lodash'
import React, { useContext, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { AiDesignerContext } from '../hooks/AiDesignerContext'
import { EditOutlined, SearchOutlined } from '@ant-design/icons'
import { htmlTagNames } from '../utils'
import { SET } from '../utils/SetExtension'
const Root = styled.div`
  font-size: 12px;
  position: absolute;

  > :first-child {
    background: var(--color-blue);
    opacity: ${p => (p.$active ? 1 : 0)};
    transform: scale(${p => (p.$active ? 1 : 0.9)});
    transform-origin: inherit;
    transition: all 0.3s;
  }
`

const SubMenu = styled.div`
  background: ${p => (p.$marked ? 'var(--color-green)' : 'var(--color-blue)')};
  box-shadow: 0 0 5px #0001;
  display: flex;
  flex-direction: column;
  max-height: ${p => (p.$show ? '220px' : 0)};
  max-width: 220px;
  min-width: ${p => (p.$show ? '220px' : 0)};
  opacity: ${p => (p.$show ? 1 : 0.5)};
  overflow: hidden;
  padding: 0;
  transition: all 0.3s linear, z-index 0s;
  width: ${p => (p.$show ? '220px' : 0)};
  z-index: ${p => (p.$show ? 9 : 1)};

  > :first-child {
    align-items: center;
    background: #0002;
    display: flex;
    height: 17px;
    padding: 0.3rem 0;
    width: 220px;

    button {
      border-radius: 0;
      color: #fffb;
      font-size: 9px;
      height: 20px;
      padding: 0 0.3rem;
      text-transform: uppercase;
    }

    small {
      color: #fffb;
    }
  }

  small,
  > span {
    color: #fafafa;
    font-size: 11px;
    font-weight: bold;
    padding: 8px;
    pointer-events: all;

    > button {
      background: none;
    }

    > input {
      background: none;
      border: none;
      border-bottom: 1px solid #fff9;
      color: #fffb;
      margin-left: 5px;
      outline: none;
      padding: 5px 0;
      width: 100%;

      ::placeholder {
        color: #fff9;
      }
    }

    .anticon svg {
      fill: #fff;
    }
  }

  > button {
    background: #fafafa;
    border: none;
    border-radius: 0;
    box-shadow: inset 0 0 5px #0001;
    color: #555;
    display: flex;
    gap: 4px;
    outline: none;
    padding: 8px 5px;
    pointer-events: all;
    transition: all 0.2s;
    width: 100%;
  }
`

const Snippet = styled.span`
  --color-states: ${p =>
    p.$active
      ? 'var(--color-green)'
      : p.$marked
      ? 'var(--color-orange)'
      : '#fff0'};
  --color-states-dark: ${p =>
    p.$active
      ? 'var(--color-green-dark)'
      : p.$marked
      ? 'var(--color-orange-dark)'
      : 'var(--color-blue-dark)'};

  background: #fafafa;
  border: none;
  border-left: 3px solid var(--color-states);
  border-radius: 0;
  box-shadow: inset 0 0 5px #0001;
  color: #555;
  display: flex;
  gap: 4px;
  height: 25px;
  outline: none;
  padding: 8px 5px;
  pointer-events: all;
  transition: all 0.2s;

  > button,
  .anticon svg {
    background: #0000;
    border: none;
    border-radius: 0;
    box-shadow: none;
    color: var(--color-states-dark);
    text-align: left;
    width: 100%;
  }

  &:hover {
    background: #f5fdfd;
  }
`
export const SnipsDropDown = () => {
  const {
    settings,
    onHistory,
    selectedCtx,
    setMarkedSnippet,
    markedSnippet,
    getCtxNode,
    showSnippets,
    setShowSnippets,
    tools,
    updateTools,
    updateSelectionBoxPosition,
  } = useContext(AiDesignerContext)

  const searchSnippetRef = useRef(null)
  const [search, setSearch] = useState('')
  const [searchByName, setSearchByName] = useState(false)

  const handleSearch = e => {
    setSearch(e.target.value)
  }

  const isAdded = name =>
    isString(tools.brush.data) && tools.brush.data.includes(`aid-snip-${name}`)
  const isMarked = name => name === markedSnippet

  const sortedSnippets = useMemo(() => {
    const { snippets } = settings.snippetsManager

    const sorted = [
      ...SET(
        [
          ...snippets.map(s => isAdded(s.className) && s),
          ...snippets.map(
            s =>
              (isAdded(s.className) ||
                s.elementType === getCtxNode()?.localName) &&
              s,
          ),
          ...snippets.map(
            s =>
              (isAdded(s.className) ||
                s.elementType !== getCtxNode()?.localName) &&
              s,
          ),
        ].filter(Boolean),
      ),
    ]

    const markedSnip = sorted.find(s => s.className === markedSnippet)

    if (markedSnip) {
      sorted.splice(
        sorted.findIndex(s => s.className === markedSnippet),
        1,
      )
      sorted.unshift(markedSnip)
    }

    return [
      ...SET(
        [...snippets.filter(s => isAdded(s.className)), ...sorted].filter(
          Boolean,
        ),
      ),
    ]
  }, [showSnippets, markedSnippet, selectedCtx.aidctx])

  // useEffect(() => {
  //   selectedCtx?.tagName && setSearch(htmlTagNames[selectedCtx.tagName])
  // }, [selectedCtx?.tagName])

  return (
    <Root $active data-element="element-options" id="snips-dropdown">
      <SubMenu
        $show={showSnippets}
        data-element="element-options"
        onMouseLeave={() => setShowSnippets(false)}
      >
        <span data-element="element-options">
          <small>Filter by:</small>
          <button
            data-element="element-options"
            onClick={() => setSearchByName(false)}
            style={{ border: `1px solid ${searchByName ? '#fff0' : '#fff5'}` }}
            type="button"
          >
            type
          </button>
          <button
            data-element="element-options"
            onClick={() => setSearchByName(true)}
            style={{ border: `1px solid ${searchByName ? '#fff5' : '#fff0'}` }}
            type="button"
          >
            name
          </button>
        </span>
        <span
          style={{
            padding: '3px 0.7rem 3px 0.7rem',
            display: 'flex',
          }}
        >
          <SearchOutlined />
          <input
            data-element="element-options"
            onChange={handleSearch}
            placeholder="Search snippet"
            ref={searchSnippetRef}
            value={search}
          />
        </span>
        <div
          style={{
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#fff',
          }}
        >
          {sortedSnippets?.length > 0
            ? sortedSnippets.map(snip => {
                const { className, elementType, description } = snip
                const searchMatch = searchByName
                  ? className
                  : htmlTagNames[elementType]?.toLowerCase() || elementType

                const filterBasedSearch = searchByName
                  ? search?.toLowerCase()?.replaceAll(' ', '-')
                  : search?.toLowerCase()

                return (
                  (search.length <= 1 ||
                    (search?.length > 1 &&
                      searchMatch.startsWith(filterBasedSearch))) && (
                    <Snippet
                      $active={!isMarked(className) && isAdded(className)}
                      $marked={isMarked(className)}
                      key={`${className}boxmenu`}
                    >
                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          onHistory.addRegistry('undo')
                          const toolsToSET = SET(tools.brush.data.split(' '))
                          const data = [
                            ...toolsToSET.toggle(`aid-snip-${className}`),
                          ].join(' ')
                          updateTools('brush', { data })
                          isMarked(className) && setMarkedSnippet('')
                        }}
                        title={description}
                        type="button"
                      >
                        {capitalize(className?.replaceAll('-', ' '))}
                      </button>
                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          setMarkedSnippet(isMarked(className) ? '' : className)
                        }}
                        style={{ width: 'fit-content' }}
                        title={`Edit snippet via prompt: \nYou can change the styles, description\n name of the snippet and/or create a copy.\n Only one snippet can be edited at a time.\n`}
                        type="button"
                      >
                        {isAdded(className) && (
                          <EditOutlined style={{ pointerEvents: 'none' }} />
                        )}
                      </button>
                    </Snippet>
                  )
                )
              })
            : null}
        </div>
      </SubMenu>
    </Root>
  )
}
