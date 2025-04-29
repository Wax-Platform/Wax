/* eslint-disable no-param-reassign */
/* eslint-disable react/no-unstable-nested-components */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { useSubscription } from '@apollo/client'
import { Tree } from 'antd'
import { cloneDeep } from 'lodash'
import styled from 'styled-components'
import { grid } from '@coko/client'
import {
  CloudUploadOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import Button from '../common/Button'
import RowRender from './RowRender'
import ConfirmDelete from '../modals/ConfirmDelete'

import DocumentContext from '../documentProvider/DocumentProvider'

import { findParentNode, findChildNodeByBookComponentId } from './utils'

import { YJS_CONTENT_UPDATED_SUBSCRIPTION } from '../../graphql'

const DocTreeManagerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;

  @keyframes slideLeft {
    0% {
      transform: translateX(0%);
    }

    100% {
      transform: translateX(-100%);
      visibility: hidden;
    }
  }

  @keyframes slideRight {
    0% {
      transform: translateX(0%);
      visibility: visible;
    }

    100% {
      transform: translateX(0%);
    }
  }
`

const ControlsWrappers = styled.div`
  align-items: center;
  background: #fff;
  border-right: 1px dotted #000;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${grid(2)};
  width: 10%;
  z-index: 1;
`

const FilesWrapper = styled.div`
  animation: ${props =>
    props.expand ? 'slideRight 2s forwards' : 'slideLeft 1s forwards'};
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: 8px 8px 8px 0;
  visibility: ${props => (props.defaultState ? 'visible' : 'hidden')};
  width: 90%;

  .ant-tree {
    background: white;
  }

  .ant-tree-treenode-disabled {
    color: black !important;

    span {
      color: black !important;
    }
  }

  ant-tree-title:hover {
    background: #c8e4f0 !important;
  }

  span.ant-tree-node-selected {
    background: #f4f2f2 !important;
  }

  .ant-tree-switcher {
    margin-top: 10px;
  }

  .ant-tree-draggable-icon {
    cursor: grab;
    margin-top: 10px;
    opacity: 1 !important;

    span svg {
      fill: #4c4949;
    }
  }
`

const StyledMainButton = styled(Button)`
  background-color: transparent;
  border: none;
  margin-bottom: ${grid(4)};
  outline: 0 !important;
  padding: 0;
  text-decoration: none;
  width: fit-content;

  &:active,
  &:focus,
  &:hover {
    background: #fff !important;
  }

  svg {
    fill: #4c4949;

    &:active,
    &:focus,
    &:hover {
      fill: #000;
    }
  }
`

const StyledUploadMainButton = styled(StyledMainButton)`
  @keyframes blink {
    0%   { opacity: 1; }
    50%  { opacity: 0; }
    100% { opacity: 1; }
  }

  animation: ${props =>
    props.animation === 'true' ? ' blink 1s infinite;' : 'unset;'};
  
  pointer-events: ${props =>
    props.animation === 'true' ? ' none;' : 'auto;'};
}
` 



const StyledMainButtonExpand = styled(StyledMainButton)`
  svg {
    transform: ${props =>
      props.expand === 'true' ? 'rotate(90deg)' : 'rotate(-90deg)'};
  }
`

const SharedTree = styled(Tree)`
  margin-left: ${grid(6)};
`

const DocTreeManager = ({
  getDocTreeData,
  addResource,
  renameResource,
  reorderResource,
  deleteResource,
  bodyDivisionId,
  bookId,
  setSelectedChapterId,
  setIsCurrentDocumentMine,
  onUploadChapter,
  documentTitle,
  isUploading,
  setUploading,
}) => {
  const { bookComponentId } = useParams()
  const { setTitle } = useContext(DocumentContext)
  let isFileManagerOpen = true

  // console.log({title})

  const [expandedKeys, setExpandedKeys] = useState(() => {
    const saved = localStorage.getItem('docTreeExpandedKeys')
    return saved ? JSON.parse(saved) : []
  })

  if (localStorage.getItem('isFileManagerOpen') !== null) {
    isFileManagerOpen = localStorage.getItem('isFileManagerOpen')
  } else {
    localStorage.setItem('isFileManagerOpen', isFileManagerOpen)
  }

  const [gData, setGData] = useState([])
  const [sharedDocTree, setSharedDocTree] = useState([])
  const [deleteResourceRow, setDeleteResourceRow] = useState(null)

  const [expandFilesArea, setExpandFilesArea] = useState(
    isFileManagerOpen === 'true',
  )

  const [defaultState, setDefaultState] = useState(expandFilesArea)

  useSubscription(YJS_CONTENT_UPDATED_SUBSCRIPTION, {
    variables: { id: bookComponentId },
    fetchPolicy: 'network-only',
    onData: async () => {
      const { data } = await getDocTreeData()
      const allData = JSON.parse(data.getDocTree)
      allData[0].disabled = true
      allData[0].isRoot = true
      allData[0].title = 'My Folders and Files'
      setGData([...allData])
      setUploading(false)
    },
  })
  // const [expandedKeys] = useState(['0-0', '0-0-0', '0-0-0-0'])

  const onDrop = async info => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]) // the drop position relative to the drop node, inside 0, top -1, bottom 1

    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i += 1) {
        if (data[i].key === key) {
          return callback(data[i], i, data)
        }

        if (data[i].children) {
          loop(data[i].children, key, callback)
        }
      }

      return true
    }

    const data = [...gData]

    // Find dragObject
    let dragObj
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, item => {
        item.children = item.children || []
        // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
        item.children.unshift(dragObj)
      })
    } else {
      let ar = []
      let i
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr
        i = index
      })

      if (dropPosition === -1) {
        // Drop on the top of the drop node
        ar.splice(i, 0, dragObj)
      } else {
        // Drop on the bottom of the drop node
        ar.splice(i + 1, 0, dragObj)
      }
    }

    setGData(data)

    const newParentNode = findParentNode(data, dragKey)
    if (!newParentNode) return

    const newPosition = newParentNode.children.findIndex(
      child => child.key === dragKey,
    )

    await reorderResource({
      variables: { id: dragKey, newParentId: newParentNode.key, newPosition },
    })
  }

  useEffect(async () => {
    const { data } = await getDocTreeData()
    const allData = JSON.parse(data.getDocTree)

    if (allData.length > 0) {
      allData[0].disabled = true
      allData[0].isRoot = true
      allData[0].title = 'My Folders and Files'
    }

    setGData([...allData])

    const sharedData = cloneDeep(data.getSharedDocTree)
    sharedData[0].isRoot = true

    setSharedDocTree([...sharedData])

    const myDocs = findChildNodeByBookComponentId(allData, bookComponentId)

    const sharedDocs = findChildNodeByBookComponentId(
      sharedData,
      bookComponentId,
    )

    if (myDocs) {
      setTitle(myDocs.title)
      setIsCurrentDocumentMine(true)
    } else if (sharedDocs) {
      setTitle(sharedDocs.title)
      setIsCurrentDocumentMine(false)
    }
  }, [])

  useEffect(() => {
    if (documentTitle) {
      const myDocs = findChildNodeByBookComponentId(gData, bookComponentId)
      if (myDocs) {
        renameResourceFn({ variables: { id: myDocs.id, title: documentTitle } })
        setTitle(documentTitle)
      }
    }
  }, [documentTitle])

  useEffect(() => {
    localStorage.setItem('docTreeExpandedKeys', JSON.stringify(expandedKeys))
  }, [expandedKeys])

  const addResourceFn = async variables => {
    await addResource(variables)

    const { data } = await getDocTreeData()
    const allData = JSON.parse(data.getDocTree)
    allData[0].disabled = true
    allData[0].isRoot = true
    allData[0].title = 'My Folders and Files'
    setGData([...allData])
  }

  const renameResourceFn = async variables => {
    await renameResource(variables)
    const { data } = await getDocTreeData()
    const allData = JSON.parse(data.getDocTree)
    allData[0].disabled = true
    allData[0].isRoot = true
    allData[0].title = 'My Folders and Files'
    setGData([...allData])
  }

  const deleteResourceFn = async variables => {
    await deleteResource(variables)
    const { data } = await getDocTreeData()
    const allData = JSON.parse(data.getDocTree)
    allData[0].disabled = true
    allData[0].isRoot = true
    allData[0].title = 'My Folders and Files'
    setGData([...allData])

    const sharedData = cloneDeep(data.getSharedDocTree)
    sharedData[0].isRoot = true

    setSharedDocTree([...sharedData])
  }

  const confirmDelete = row => {
    setDeleteResourceRow(row)
  }

  const parts = window.location.href.split('/')
  const currentIdentifier = parts[parts.length - 1]

  const getActiveDocForDeletion = findChildNodeByBookComponentId(
    deleteResourceRow ? [deleteResourceRow] : [],
    currentIdentifier,
  )

  if (gData.length == 0) return null

  return (
    <DocTreeManagerWrapper>
      <ControlsWrappers>
        <StyledMainButton
          onClick={() =>
            addResourceFn({ variables: { id: null, isFolder: true } })
          }
          title="Add Root Folder"
        >
          <FolderAddOutlined style={{ fontSize: '24px' }} />
        </StyledMainButton>
        <StyledMainButton
          onClick={() =>
            addResourceFn({
              variables: {
                id: null,
                bookId,
                divisionId: bodyDivisionId,
                isFolder: false,
              },
            })
          }
          title="Add Root File"
        >
          <FileAddOutlined style={{ fontSize: '24px' }} />
        </StyledMainButton>
        <StyledUploadMainButton animation={isUploading.toString()} onClick={onUploadChapter} title="Upload a Document">
          <CloudUploadOutlined style={{ fontSize: '24px' }} />
        </StyledUploadMainButton>
        <StyledMainButtonExpand
          expand={expandFilesArea.toString()}
          onClick={() => {
            setDefaultState(true)
            localStorage.setItem('isFileManagerOpen', !expandFilesArea)
            setExpandFilesArea(!expandFilesArea)
          }}
          title="Show / Hide Filemanager"
        >
          <VerticalAlignBottomOutlined style={{ fontSize: '24px' }} />
        </StyledMainButtonExpand>
      </ControlsWrappers>
      <FilesWrapper defaultState={defaultState} expand={expandFilesArea}>
        <Tree
          expandedKeys={expandedKeys}                       // controlled prop
          onExpand={(newKeys) => setExpandedKeys(newKeys)}  // update state
          allowDrop={node => {
            if (
              (node.dropPosition <= 0 && node.dropNode.isRoot) ||
              (node.dropPosition === 0 && !node.dropNode.isFolder)
            ) {
              return false
            }

            return true
          }}
          blockNode
          className="draggable-tree"
          // defaultExpandAll
          draggable
          key="myDocs"
          // defaultExpandedKeys={expandedKeys}
          onDrop={onDrop}
          titleRender={rowProps => {
            return (
              <RowRender
                {...rowProps}
                addResource={addResourceFn}
                bodyDivisionId={bodyDivisionId}
                bookId={bookId}
                confirmDelete={confirmDelete}
                myFiles
                renameResource={renameResourceFn}
                setIsCurrentDocumentMine={setIsCurrentDocumentMine}
                setSelectedChapterId={setSelectedChapterId}
              />
            )
          }}
          treeData={gData}
        />

        <SharedTree
          blockNode
          key="sharedDocTree"
          titleRender={rowProps => {
            return (
              <RowRender
                {...rowProps}
                confirmDelete={confirmDelete}
                myFiles={false}
                setIsCurrentDocumentMine={setIsCurrentDocumentMine}
                setSelectedChapterId={setSelectedChapterId}
              />
            )
          }}
          treeData={sharedDocTree}
        />
      </FilesWrapper>
      <ConfirmDelete
        deleteResourceFn={deleteResourceFn}
        deleteResourceRow={
          deleteResourceRow?.isFolder
            ? getActiveDocForDeletion || deleteResourceRow
            : deleteResourceRow
        }
        setDeleteResourceRow={setDeleteResourceRow}
      />
    </DocTreeManagerWrapper>
  )
}

export default DocTreeManager
