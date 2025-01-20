/* stylelint-disable no-descending-specificity */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { capitalize, keys } from 'lodash'
import {
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusOutlined,
  PlusOutlined,
  FullscreenOutlined,
  SwitcherFilled,
  UpCircleFilled,
  DownCircleFilled,
  PictureFilled,
} from '@ant-design/icons'
import ReactCodeMirror from '@uiw/react-codemirror'
import { css as cssLang } from '@codemirror/lang-css'
import {
  addElement,
  formatDate,
  handleImgElementSelection,
  htmlTagNames,
  parseContent,
} from '../utils'
import Each from '../utils/Each'
import {
  AiDesignerContext,
  useAiDesignerContext,
} from '../hooks/AiDesignerContext'
import Toggle from './Toggle'
import { Files } from '../../rag-test-component/Files'

const tabsColors = {
  snippets: 'var(--color-blue)',
  images: 'var(--color-orange)',
  template: 'var(--color-yellow)',
  files: 'var(--color-green)',
}

const tabsBorders = {
  snippets: 'var(--color-blue-dark)',
  images: 'var(--color-orange-dark)',
  template: 'var(--color-yellow-dark)',
  files: 'var(--color-green-dark)',
}

const ButtonBase = styled.button.attrs({ type: 'button' })`
  display: flex;
  background-color: transparent;
  border: none;
  border-radius: 0;
  color: #555;
  cursor: pointer;
  margin: 0;
  outline: none;
  width: fit-content;
`

const imagesShow = keyframes`
from {
  transform: scale(0);
  opacity: 0;
}

to {
  transform: scale(1);
  opacity: 1;
}
`

const Root = styled.div`
  --grid-images-per-row: 5;

  background-color: #fff;
  border-left: ${p => (p.alignment === 'right' ? '1px solid #0002' : '')};
  border-right: ${p => (p.alignment === 'left' ? '1px solid #0002' : '')};
  box-shadow: 0 11px 10px #0001;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 60vh;
  min-width: 40vw;
  overflow: hidden;
  position: absolute;
  top: -1px;
  z-index: 9999999;

  > div {
    background: #f8f8f8;
    /* border-top: 1px solid #0002; */
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
  }
`

const ListContainer = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  margin-top: 5px;
  padding: 15px;
`

const ListItem = styled.li`
  --color-states: ${p =>
    p.$active
      ? 'var(--color-green)'
      : p.$marked
      ? 'var(--color-orange)'
      : 'var(--color-blue)'};
  --color-states-dark: ${p =>
    p.$active
      ? 'var(--color-green-dark)'
      : p.$marked
      ? 'var(--color-orange-dark)'
      : 'var(--color-blue-dark)'};
  --color-enabled: var(--color-states);
  --height: 10px;

  background-color: ${p => (p.$selected ? '#fff9' : '#fffd')};
  border: 1px solid #0004;
  border-left: 8px solid var(--color-states);
  border-radius: 0 1rem 1rem 0;
  box-shadow: 0 0 6px #0003;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.5rem 0;
  pointer-events: all;
  transform: scale(${p => (p.$selected ? 1.01 : 0.98)});
  transition: all 0.3s;

  > span {
    padding: 0.2rem 0.5rem 0.2rem 1rem;
  }

  > :first-child {
    color: var(--color-states-dark);
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding: 0.2rem;

    h4 {
      border-radius: 0.5rem;
      margin: 0;
      padding: 0.2rem 0.5rem;
    }

    span {
      /* display: flex;
      gap: 4px;
      padding-right: 0.2rem; */
      > svg {
        height: 12px;
        width: 12px;
      }
    }
  }

  > :last-child {
    strong {
      align-self: flex-end;
      background-color: var(--color-states);
      border-radius: 1rem;
      color: #fff;
      font-size: 12px;
      margin-top: 0.5rem;
      padding: 0.3rem 0.7rem;
      transition: background-color 0.3s;
      width: fit-content;
    }

    > span {
      border-left: 1px solid #0002;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0.2rem 0.5rem;
      white-space: pre-line;
    }
  }
`

const Heading = styled.span`
  align-items: center;
  border: 1px solid gainsboro;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  overflow: visible;
  padding: 0;
  z-index: 99;
  /* cursor: ${p => (p.$dragging ? 'grabbing' : 'grab')}; */
  > span {
    height: 38px;
    display: flex;
    padding: 3px 0 0 3px;
    gap: 3px;

    > svg,
    .anticon svg {
      display: flex;
      height: 18px;
      width: 18px;
    }
  }

  .anticon svg {
    color: #777;
  }
`

const Group = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 3px 0 8px;
  p {
    margin: 0;
  }

  span {
    display: flex;
  }
`

const MainTab = styled(ButtonBase)`
  align-self: flex-end;
  align-items: center;
  border-radius: 0.5rem 0.5rem 0 0;
  border: 1px solid gainsboro;
  border-bottom: 1px solid ${p => (p.$selected ? `#f8f8f8` : '#0001')};
  background-color: ${p => (p.$selected ? `#f8f8f8` : '#f5f5f5')};
  background-image: linear-gradient(
    to bottom,
    ${p => (p.$selected ? `#f8f8f8` : '#f5f5f5')} 80%,
    ${p => (p.$selected ? `#f8f8f8` : '#eee')}
  );
  height: ${p => (p.$selected ? '35px' : '34px')};
  justify-content: center;
  padding: 10px 25px 10px 15px;
  min-width: 10%;
  margin-bottom: -1px;
  transition: all 0.3s;

  > h3 {
    align-items: center;
    display: flex;
    gap: 10px;
    color: ${p => (p.$selected ? tabsBorders[p.$tabkey] : '#aaa')};
    font-weight: normal;
    font-size: 12px;
    text-transform: uppercase;
    line-height: 1;
    margin: 0;
    transition: color 0.2s;

    &::before {
      display: flex;
      content: ' ';
      border-radius: 50%;
      width: 8px;
      height: 8px;
      opacity: ${p => (p.$selected ? `1` : '0.5')};
      filter: grayscale(${p => (!p.$selected ? `30%` : '0')});
      transition: all 0.3s;

      background-color: ${p => tabsColors[p.$tabkey]};
    }
  }
`

const SnippetOptions = styled.span`
  align-self: flex-end;
  background: #fffd;
  border: 1px solid var(--color-blue-alpha);
  border-radius: 1rem;
  box-shadow: 0 0 3px #0002;
  font-size: 12px;
  gap: 8px;
  height: fit-content;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 0.3rem 0.5rem;
  position: fixed;
  width: fit-content;
  z-index: 99999999;

  svg {
    color: var(--color-blue);
  }
`

const SnippetsFilterButton = styled(ButtonBase)`
  margin-inline: 8px;
  padding-inline: 0;
  transition: all 0.3s ease-in-out;
`

const TypesList = styled.span`
  background-color: #f8f8f8;
  border-bottom: 1px solid #0001;
  display: flex;
  padding: 0.8rem 0.5rem;
`

const CssEditor = styled(ReactCodeMirror)`
  > :first-child {
    border: 1px solid #0002;
    border-radius: 8px;
    margin-top: 5px;
    max-height: 300px;
    min-height: 200px;
  }

  > :last-child span {
    border-left: none;
    display: inline-block;
    padding: 0;
    white-space: unset;
  }
`

const ImagesGridList = styled(ListContainer)`
  --list-container-padding: 15px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  height: fit-content;
  width: 100%;
  padding: var(--list-container-padding);
`

const ImageItem = styled.li`
  animation: ${imagesShow} 0.5s;
  animation-delay: ${p => `${0.1 * p.$index}s`};
  animation-fill-mode: forwards;
  aspect-ratio: 1 / 1;
  display: flex;
  width: calc(
    (100% / var(--grid-images-per-row)) -
      round(up, var(--list-container-padding) / 2, 1px)
  );
  object-fit: contain;
  opacity: 0;
  position: relative;

  > img {
    aspect-ratio: 1 / 1;
    object-fit: contain;
    width: 100%;
  }

  > span {
    display: flex;
    position: absolute;
    padding: 5px 8px;
    margin: 3px;
    gap: 5px;
    right: 0;
    background-color: #fffb;
    border-radius: 10px;
    box-shadow: 0 0 3px #0007;
    opacity: 0.7;
    pointer-events: none;
    transition: all 0.4s;

    svg {
      color: var(--color-blue);
    }
  }

  &:hover {
    > span {
      opacity: 1;
      pointer-events: all;
    }
  }
`

const TemplateEditor = styled(CssEditor)`
  > :first-child {
    height: 100%;
    max-height: unset;
  }
`

const SnippetItem = ({
  snippetName,
  snippetValue,
  updatePreview,
  removeSnip,
  filter,
  selectedSnippets,
  setSelectedSnippets,
}) => {
  const {
    markedSnippet,
    selectedCtx,
    nodeIsHtmlSrc,
    setMarkedSnippet,
    htmlSrc,
    updateSnippetBody,
    settings,
    editorContent,
    setEditorContent,
    getCtxNode,
  } = useAiDesignerContext()

  const [showCss, setShowCss] = useState(
    settings.snippetsManager.showCssByDefault,
  )

  const isMarked = markedSnippet === snippetName

  const isAdded = getCtxNode()?.classList.contains(`aid-snip-${snippetName}`)

  const nodeHasMarkedSnip = getCtxNode()?.classList.contains(
    `aid-snip-${markedSnippet}`,
  )

  const containsClass = !nodeIsHtmlSrc && isAdded

  const handleToggleSnippet = e => {
    e.preventDefault()
    e.stopPropagation()
    !nodeIsHtmlSrc &&
      snippetName &&
      setEditorContent(
        parseContent(editorContent, dom => {
          const node = dom.querySelector(`[data-id="${selectedCtx.id}"]`)

          node.classList.toggle(`aid-snip-${snippetName}`)
        }),
      )

    isAdded && isMarked
      ? setMarkedSnippet('')
      : !nodeHasMarkedSnip && setMarkedSnippet('')
    updatePreview()
  }

  const handleEdit = e => {
    e.preventDefault()
    e.stopPropagation()
    setMarkedSnippet(isMarked ? '' : snippetName)
  }

  const handleDelete = e => {
    e.preventDefault()
    e.stopPropagation()
    removeSnip(snippetName)
  }

  const handleCode = e => {
    e.preventDefault()
    e.stopPropagation()
    setShowCss(!showCss)
  }

  const handleToggleSelectSnippet = e => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSnippets(prev =>
      selectedSnippets.includes(snippetName)
        ? prev.filter(s => s !== snippetName)
        : [...prev, snippetName],
    )
  }

  return (snippetValue.elementType === filter || filter === 'all' || !filter) &&
    snippetName ? (
    <ListItem
      $active={!isMarked && isAdded}
      $marked={isMarked}
      $selected={selectedSnippets.includes(snippetName)}
      key={`${snippetName}-sn`}
      onClick={handleToggleSelectSnippet}
    >
      <span>
        <h4>{capitalize(snippetName.replaceAll('-', ' '))}</h4>
        <span
          style={{
            alignItems: 'center',
            gap: '6px',
            height: 'fit-content',
            paddingRight: '8px',
          }}
        >
          {isAdded && isMarked && <small>editing</small>}
          {isMarked && (
            <CodeOutlined
              onClick={handleCode}
              title={`${showCss ? 'Hide' : 'Show'} CSS editor`}
            />
          )}
          {isAdded && (
            <EditOutlined
              onClick={handleEdit}
              title={`Edit snippet via prompt: \nYou can update the styles, description\n name of the snippet and/or create a copy.\n Only one snippet can be edited at a time.\n`}
            />
          )}
          <DeleteOutlined
            onClick={handleDelete}
            style={{ marginRight: '8px' }}
            title="Remove snippet(from document)"
          />
          {selectedCtx?.node !== htmlSrc && (
            <Toggle
              checked={containsClass}
              handleChange={handleToggleSnippet}
              style={{ margin: 0 }}
              title="Add snippet"
            />
          )}
        </span>
      </span>
      <span style={{ flexDirection: 'column' }}>
        <span>
          <small>Description:</small>
          <p style={{ padding: '0 0.5rem' }}>{`${capitalize(
            snippetValue.description,
          )}`}</p>
        </span>
        {isMarked && showCss && (
          <CssEditor
            extensions={[cssLang()]}
            onChange={content => {
              updateSnippetBody(snippetName, content)
              updatePreview(true)
            }}
            value={snippetValue.classBody}
          />
        )}
        <strong>
          {htmlTagNames[snippetValue.elementType] ||
            capitalize(snippetValue.elementType)}
        </strong>
      </span>
    </ListItem>
  ) : null
}

const ImagesTabContent = ({ imagesData, getImageUrl, updatePreview }) => {
  const {
    selectedCtx,
    htmlSrc,
    setUserImages,
    promptRef,
    onHistory,
    editorContent,
    setEditorContent,
  } = useAiDesignerContext()

  const ctxIsHtmlSrc = selectedCtx?.node === htmlSrc
  const [images, setImages] = useState([...imagesData])
  const [newImages, setNewImages] = useState([])

  useEffect(() => {
    setNewImages(
      imagesData
        .map(img => img.key)
        .filter(imgkey => !images.map(img => img.key).includes(imgkey)),
    )
    imagesData && setImages(imagesData)
  }, [imagesData])

  const switchImages = async key => {
    const src = await handleImgElementSelection({
      getImageUrl,
      imageKey: key.replace('_medium.png', '_full.png'),
    })

    onHistory.addRegistry('undo')
    setEditorContent(
      parseContent(editorContent, dom => {
        const node = dom.querySelector(`[data-id="${selectedCtx.id}"]`)
        node.setAttribute('src', src)
        node.setAttribute(
          'data-imgkey',
          key.replace('_medium.png', '_full.png'),
        )
      }),
    )
    updatePreview(true)
  }

  const addImage = async (position, key) => {
    const src = await handleImgElementSelection({
      getImageUrl,
      imageKey: key.replace('_medium.png', '_full.png'),
    })

    onHistory.addRegistry('undo')

    addElement(selectedCtx?.node, {
      position,
      html: `<img src="${src}" alt="dall-e generated img" data-imgkey="${key.replace(
        '_medium.png',
        '_full.png',
      )}" class="aid-snip-img-default"/>`,
    })

    updatePreview(true)
  }

  const sendImageToPrompt = key => {
    handleImgElementSelection({
      setUserImages,
      getImageUrl,
      imageKey: key,
    })
    promptRef?.current.focus()
  }

  const imageItem = ({ url, key, modified }, i) => (
    <ImageItem
      $index={!newImages.includes(key) ? i : 0}
      title={`Generated on: ${formatDate(modified)}`}
    >
      <span>
        <PictureFilled
          onClick={() => sendImageToPrompt(key)}
          title="Send to prompt"
        />
        {!ctxIsHtmlSrc && (
          <>
            {selectedCtx?.node.localName === 'img' && (
              <SwitcherFilled
                onClick={async () => switchImages(key)}
                title="Replace selected image"
              />
            )}
            <UpCircleFilled
              onClick={async () => addImage('beforebegin', key)}
              title={`Insert before the selected ${htmlTagNames[
                selectedCtx?.node.localName
              ]?.toLowerCase()}`}
            />
            <DownCircleFilled
              onClick={async () => addImage('afterend', key)}
              title={`Insert after the selected ${htmlTagNames[
                selectedCtx?.node.localName
              ]?.toLowerCase()}`}
            />
          </>
        )}
      </span>
      <img alt="dall-e generated img" data-imgkey={key} src={url} />
    </ImageItem>
  )

  return (
    <ImagesGridList>
      <Each
        condition={imagesData.length > 0}
        fallback={<p>No images added</p>}
        of={imagesData}
        render={imageItem}
      />
    </ImagesGridList>
  )
}

// eslint-disable-next-line react/prop-types
export const Manage = ({
  updatePreview,
  alignment = 'right',
  imagesData,
  getImageUrl,
  chunksLoading,
  createDocument,
  deleteDocument,
  documents,
  getChunks,
}) => {
  const {
    settings,
    onHistory,
    removeSnippet,
    selectedCtx,
    htmlSrc,
    markedSnippet,
    setMarkedSnippet,
    setCss,
    css,
  } = useAiDesignerContext()

  const [width, setWidth] = useState('50%')
  const [filter, setFilter] = useState('all')
  const [selectedSnippets, setSelectedSnippets] = useState([])
  const [currentTab, setCurrentTab] = useState(keys(tabsColors)[0])

  const setTab = tabName => {
    keys(tabs).includes(tabName) && setCurrentTab(tabName)
  }

  const removeSnip = name => {
    onHistory.addRegistry('undo')
    removeSnippet(name)
    markedSnippet === name && setMarkedSnippet('')
    updatePreview()
  }

  const nodeIsHtmlSrc = selectedCtx?.node === htmlSrc

  const mapSnippets = ({ className, ...rest }) => (
    <SnippetItem
      filter={filter}
      key={`${className}snipmanager`}
      removeSnip={removeSnip}
      selectedSnippets={selectedSnippets}
      setSelectedSnippets={setSelectedSnippets}
      snippetName={className}
      snippetValue={rest}
      updatePreview={updatePreview}
    />
  )

  const allElementTypes = [
    'all',
    ...new Set(
      settings.snippetsManager.snippets.map(v => v.elementType).reverse(),
    ),
  ]

  const mappedSnippets = useMemo(
    () => settings.snippetsManager.snippets.map(mapSnippets).reverse(),
    [
      selectedCtx,
      mapSnippets,
      settings.snippetsManager.snippets,
      filter,
      selectedSnippets,
    ],
  )

  const handleAddAllSelected = e => {
    e.stopPropagation()
    selectedSnippets.forEach(snippet => {
      selectedCtx?.node.classList.add(`aid-snip-${snippet}`)
    })
    updatePreview(true)
  }

  const handleRemoveAllSelected = () => {
    selectedSnippets.forEach(snippet => {
      selectedCtx?.node.classList.remove(`aid-snip-${snippet}`)
    })
    updatePreview(true)
  }

  const handleDeleteAllSelected = () => {
    selectedSnippets.forEach(snippet => {
      removeSnip(snippet)
    })
    setSelectedSnippets([])
    updatePreview(true)
  }

  const tabs = {
    snippets: (
      <>
        <TypesList onClick={e => e.stopPropagation()}>
          {allElementTypes.map(type => (
            <SnippetsFilterButton
              key={type}
              onClick={e => {
                e.stopPropagation()
                setFilter(type)
                setSelectedSnippets([])
              }}
              style={{
                borderBottom: `2px solid ${
                  filter === type ? 'var(--color-blue)' : '#fff0'
                }`,
              }}
            >
              {htmlTagNames[type] ? htmlTagNames[type] : capitalize(type)}
            </SnippetsFilterButton>
          ))}
        </TypesList>

        <Group style={{ position: 'relative', overflowY: 'scroll' }}>
          {selectedSnippets.length > 1 && (
            <SnippetOptions>
              {!nodeIsHtmlSrc && (
                <>
                  <PlusOutlined
                    onClick={handleAddAllSelected}
                    title="Add selected snippets"
                  />
                  <MinusOutlined
                    onClick={handleRemoveAllSelected}
                    title="Remove selected snippets"
                  />
                </>
              )}
              <DeleteOutlined
                onClick={handleDeleteAllSelected}
                title="Remove selected snippets (from document)"
              />
            </SnippetOptions>
          )}
          <ListContainer>{mappedSnippets}</ListContainer>
        </Group>
      </>
    ),
    images: (
      <Group style={{ position: 'relative', overflowY: 'scroll' }}>
        <ImagesTabContent
          getImageUrl={getImageUrl}
          imagesData={imagesData?.getGeneratedImages}
          updatePreview={updatePreview}
        />
      </Group>
    ),
    template: (
      <TemplateEditor
        extensions={[cssLang()]}
        onChange={content => {
          setCss(content)
          updatePreview(true)
        }}
        value={css}
      />
    ),
    files: (
      <Files
        chunksLoading={chunksLoading}
        createDocument={createDocument}
        deleteDocument={deleteDocument}
        documents={documents}
        getChunks={getChunks}
      />
    ),
  }

  return (
    <Root
      alignment={width !== '100%' && alignment}
      onClick={() => setSelectedSnippets([])}
      style={{ [alignment]: 0, width }}
    >
      <Heading>
        <span style={{ width: '100%', overflow: 'visible' }}>
          {keys(tabs).map(tab => (
            <MainTab
              $selected={tab === currentTab}
              $tabkey={tab}
              key={tab}
              onClick={() => setTab(tab)}
            >
              <h3>{capitalize(tab)}</h3>
            </MainTab>
          ))}
        </span>
        <FullscreenOutlined
          onClick={() => setWidth(width === '50%' ? '100%' : '50%')}
          style={{ color: '#fff', padding: '0 10px 0 0' }}
        />
      </Heading>
      {tabs[currentTab]}
    </Root>
  )
}

export default Manage
