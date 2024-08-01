/* stylelint-disable indentation */
/* stylelint-disable no-descending-specificity */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import {
  DeleteOutlined,
  EditOutlined,
  MinusOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { capitalize, debounce } from 'lodash'
import { AiDesignerContext } from './hooks/AiDesignerContext'
import { htmlTagNames } from './utils'
import AiDesigner from '../../AiDesigner/AiDesigner'

const AbsoluteContainer = styled.span`
  background-color: ${p => p.selectionColor.bg || 'var(--color-blue-alpha-2)'};
  border: 1px dashed
    ${p => p.selectionColor.border || 'var(--color-blue-alpha-1)'};
  display: flex;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: top 0.3s, left 0.3s, width 0.3s, height 0.3s, opacity 0.3s;
  z-index: 999;
`

const RelativeContainer = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  gap: 5px;
  height: 35px;
  justify-content: space-between;
  margin-top: -35px;
  position: relative;
  white-space: nowrap;
  width: 100%;
  z-index: 999;

  button {
    background: var(--color-trois);
    border: none;
    border-radius: 50%;
    box-shadow: 0 0 4px #0002;
    color: #eee;
    cursor: pointer;
    outline: none;
    padding: 5px;
    pointer-events: all;
  }

  > span,
  > span > span {
    display: flex;
    gap: 4px;
  }

  > small.element-type {
    background-color: #fffe;
    border-radius: 5px;
    box-shadow: 0 0 4px #0002;
    color: var(--color-trois);
    line-height: 1;
    padding: 5px 8px;
  }
`

/* eslint-disable react/prop-types */
const SelectionBox = ({ yOffset = 10, xOffset = 10, ...rest }) => {
  const {
    selectionBoxRef,
    selectedCtx,
    updateSelectionBoxPosition,
    settings,
    editorContainerRef,
  } = useContext(AiDesignerContext)

  const { advancedTools } = settings.gui

  useLayoutEffect(() => {
    if (!settings.editor.enableSelection) return
    updateSelectionBoxPosition(yOffset, xOffset)
    editorContainerRef?.current?.addEventListener(
      'scroll',
      updateSelectionBoxPosition,
    )
    editorContainerRef?.current?.addEventListener(
      'resize',
      updateSelectionBoxPosition,
    )

    return () => {
      editorContainerRef?.current?.removeEventListener(
        'scroll',
        updateSelectionBoxPosition,
      )

      editorContainerRef?.current?.removeEventListener(
        'resize',
        updateSelectionBoxPosition,
      )
    }
  }, [selectedCtx?.node])
  if (!settings.editor.enableSelection) return null

  return (
    <AbsoluteContainer
      data-rel-aidctx={selectedCtx?.aidctx}
      ref={selectionBoxRef}
      selectionColor={settings.editor.selectionColor}
      {...rest}
    >
      {advancedTools && (
        <RelativeContainer>
          <small className="element-type">
            {htmlTagNames[selectedCtx?.tagName] || 'Document'}
          </small>
          <span>
            <SnippetsDropdown />
          </span>
        </RelativeContainer>
      )}
    </AbsoluteContainer>
  )
}

export default SelectionBox

const Root = styled.div`
  > :first-child {
    opacity: ${p => (p.$active ? 1 : 0.4)};
    transform: scale(${p => (p.$active ? 1 : 0.9)});
    transition: all 0.3s;
    z-index: 99;
  }
`

const SubMenu = styled.div`
  --background: ${p =>
    p.$show ? (p.$ctrlPressed ? 'var(--color-secondary)' : '#ddd') : '#0000'};
  background: linear-gradient(
        0deg,
        var(--color-secondary),
        var(--color-trois) 90%
      )
      padding-box,
    linear-gradient(0deg, var(--color-secondary), var(--color-trois) 90%)
      border-box;
  border: ${p => (p.$show ? '4px' : 0)} solid transparent;
  border-radius: 5px;
  border-top-width: 3px;
  bottom: 12px;
  box-shadow: 0 0 5px #0001;
  display: flex;
  flex-direction: column;
  max-height: ${p => (p.$show ? '228px' : 0)};
  max-width: ${p => (p.$show ? 'calc(300px)' : 0)};
  min-height: ${p => (p.$show ? '228px' : 0)};
  min-width: ${p => (p.$show ? 'calc(300px)' : 0)};
  opacity: ${p => (p.$show ? 1 : 0.5)};
  overflow: hidden;
  padding: 0;
  position: absolute;
  right: 5px;
  transition: max-height 0.4s linear, min-width 0.5s 0.5s, man-width 0.5s 0.5s;
  width: fit-content;
  z-index: ${p => (p.$show ? 9 : 1)};

  > :first-child {
    background: #0002;
    padding: 0.3rem 0;

    button {
      border-radius: 0;
      color: #fffb;
      font-size: 9px;
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

    button {
      background: none;
    }

    > span {
      > input {
        background: none;
        border: none;
        border-bottom: 1px solid #fff9;
        color: #fffb;
        margin-left: 5px;
        max-width: ${p => (p.$showSearchInput ? '150px' : '0')};
        outline: none;
        padding: 5px 0;
        /* width: 100%; */
        transition: all 0.3s;

        ::placeholder {
          color: #fff9;
        }
      }
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
    /* width: 100%; */
  }
`

const Snippet = styled.span`
  --color-states: ${p =>
    p.$active
      ? 'var(--color-primary)'
      : p.$marked
      ? 'var(--color-yellow)'
      : '#ddd'};
  --color-states-dark: ${p =>
    p.$active
      ? 'var(--color-primary-dark)'
      : p.$marked
      ? 'var(--color-yellow-dark)'
      : 'var(--color-trois)'};
  --font-weight: ${p => (p.$active || p.$marked ? '700' : '200')};

  background: #fafafa;
  border: none;
  border-left: 4px solid var(--color-states);
  border-radius: 0;
  box-shadow: inset 0 0 5px #0001;
  color: #555;
  display: flex;
  gap: 4px;
  justify-content: space-between;
  outline: none;
  padding: 8px 5px;
  pointer-events: all;
  transition: all 0.2s;

  button {
    background: #0000;
    border: none;
    border-radius: 0;
    box-shadow: none;
    cursor: pointer;
  }

  .snippet-actions {
    gap: 3px;
    opacity: 0;
    transition: opacity 0.5s;

    > button {
      color: var(--color-states-dark);
      height: 15px;
      padding: 3px;
      width: 15px;

      .anticon {
        font-size: 12px;
        transition: transform 0.3s;
      }
    }
  }

  > button,
  > span:not(.snippet-actions) > button {
    color: var(--color-states-dark);
    font-weight: var(--font-weight);
    text-align: left;
  }

  &:hover {
    background: var(--color-secondary-fade);

    .snippet-actions {
      opacity: 1;

      > button {
        &:hover {
          .anticon {
            transform: scale(1.2) translateY(-5px);
          }
        }
      }
    }
  }
`

export const SnippetsDropdown = () => {
  const {
    settings,
    onHistory,
    selectedCtx,
    setMarkedSnippet,
    markedSnippet,
    getCtxNode,
    updatePreview,
    userInteractions,
    removeSnippet,
    designerOn,
  } = useContext(AiDesignerContext)

  if (!settings.editor.enableSelection) return null

  const searchSnippetRef = useRef(null)
  const [showSnippets, setShowSnippets] = useState(false)
  const [search, setSearch] = useState('')
  const [searchByName, setSearchByName] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)

  const handleSearch = e => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    setShowSnippets(false)
  }, [selectedCtx.aidctx])

  const isAdded = name => getCtxNode()?.classList?.contains(`aid-snip-${name}`)
  const isMarked = name => name === markedSnippet

  const sortedSnippets = useMemo(() => {
    const { snippets } = settings.snippetsManager

    const sorted = [
      ...snippets.map(s => isAdded(s.className) && s),
      ...snippets.map(
        s =>
          !isAdded(s.className) &&
          s.elementType === getCtxNode()?.localName &&
          s,
      ),
      ...snippets.map(
        s =>
          !isAdded(s.className) &&
          s.elementType !== getCtxNode()?.localName &&
          s,
      ),
    ].filter(Boolean)

    const markedSnip = sorted.find(s => s.className === markedSnippet)

    if (markedSnip) {
      sorted.splice(
        sorted.findIndex(s => s.className === markedSnippet),
        1,
      )
      sorted.unshift(markedSnip)
    }

    return sorted
  }, [
    showSnippets,
    markedSnippet,
    selectedCtx.aidctx,
    settings.snippetsManager.snippets,
  ])

  return (
    <Root $active>
      <SubMenu
        $showSearchInput={showSearchInput}
        $ctrlPressed={!!userInteractions.ctrl}
        $show={designerOn && showSnippets}
        // onMouseLeave={() => setShowSnippets(false)}
        style={{ marginTop: '7px' }}
      >
        <span>
          <small>Filter by:</small>
          <button
            onClick={() => setSearchByName(false)}
            style={{ border: `1px solid ${searchByName ? '#fff0' : '#fff5'}` }}
            type="button"
          >
            type
          </button>
          <button
            onClick={() => setSearchByName(true)}
            style={{ border: `1px solid ${searchByName ? '#fff5' : '#fff0'}` }}
            type="button"
          >
            name
          </button>
        </span>
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '3px 0.7rem 3px 0.7rem',
            alignItems: 'center',
          }}
        >
          <span>
            {userInteractions.ctrl
              ? `All ${htmlTagNames[selectedCtx.tagName]}s`
              : `${htmlTagNames[selectedCtx.tagName]}`}
          </span>
          <span>
            <input
              onChange={handleSearch}
              placeholder="Search snippet"
              ref={searchSnippetRef}
              value={search}
            />
            <SearchOutlined onClick={() => setShowSearchInput(p => !p)} />
          </span>
        </span>
        <div
          style={{
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#fff',
            borderRadius: '3px',
            boxShadow: 'inset 0 0 3px #0004',
            paddingBottom: '20px',
            height: '160px%',
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

                const handleSnippets = e => {
                  e.preventDefault()
                  e.stopPropagation()
                  const action =
                    e.target.getAttribute('data-action') ?? 'toggle'
                  const { tagName } = selectedCtx
                  onHistory.addRegistry('undo')

                  if (action === 'delete') {
                    removeSnippet(className)
                    AiDesigner.filterBy({ tagName }, c =>
                      c.snippets.remove(`aid-snip-${className}`),
                    )
                  } else {
                    userInteractions.ctrl
                      ? AiDesigner.filterBy({ tagName }, c =>
                          c.snippets[action](`aid-snip-${className}`),
                        )
                      : selectedCtx.snippets[action](`aid-snip-${className}`)
                  }

                  debounce(() => {
                    setShowSnippets(true)
                  }, 100)()

                  updatePreview()
                  isMarked(className) && setMarkedSnippet('')
                }
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
                        data-action="toggle"
                        onClick={handleSnippets}
                        title={description}
                        type="button"
                      >
                        {capitalize(className?.replaceAll('-', ' '))}
                      </button>
                      <span
                        className="snippet-actions"
                        style={{ display: 'flex' }}
                      >
                        <button
                          data-action="add"
                          onClick={handleSnippets}
                          title={description}
                          type="button"
                        >
                          <PlusOutlined style={{ pointerEvents: 'none' }} />
                        </button>{' '}
                        <button
                          data-action="remove"
                          onClick={handleSnippets}
                          title={description}
                          type="button"
                        >
                          <MinusOutlined style={{ pointerEvents: 'none' }} />
                        </button>
                        <button
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            setMarkedSnippet(
                              isMarked(className) ? '' : className,
                            )
                          }}
                          title={`Edit snippet via prompt: \nYou can change the styles, description\n name of the snippet and/or create a copy.\n Only one snippet can be edited at a time.\n`}
                          type="button"
                        >
                          <EditOutlined style={{ pointerEvents: 'none' }} />
                        </button>
                        <button
                          data-action="delete"
                          onClick={handleSnippets}
                          title={`Delete snipet (not undoable)`}
                          type="button"
                        >
                          <DeleteOutlined style={{ pointerEvents: 'none' }} />
                        </button>
                      </span>
                    </Snippet>
                  )
                )
              })
            : null}
        </div>
      </SubMenu>
      <button
        id="element-snippets"
        label="show snippets"
        onClick={() => setShowSnippets(!showSnippets)}
        style={{
          background: '#fffe',
          color: 'var(--color-trois)',
          position: 'relative',
          transform: `scale(${showSnippets ? '0.7' : '1'})`,
          transition: 'all 0.5s',
          zIndex: '99',
        }}
        title="Add snippet"
        type="button"
      >
        <PlusOutlined
          style={{
            pointerEvents: 'none',
            transition: 'all 0.5s',
            transform: `rotate(${showSnippets ? '45deg' : '0'})`,
          }}
        />
      </button>
    </Root>
  )
}
