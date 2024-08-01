/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable rule-empty-line-before */
/* stylelint-disable declaration-no-important */
/* stylelint-disable order/properties-alphabetical-order */
import React, { useEffect, useState } from 'react'
import { Tree } from 'antd'
import { cloneDeep } from 'lodash'
import styled from 'styled-components'
import { grid } from '@coko/client'
import {
  FolderAddFilled,
  FileAddFilled,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons'
import Button from '../../common/Button'
import RowRender from './RowRender'
import ConfirmDelete from '../../modals/ConfirmDelete'
import { findParentNode, findChildNodeByIdentifier } from './utils'

const ControlsWrappers = styled.div`
  background: #f6edf6;
  border-right: 1px solid #0004;
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100%;
  width: 50px;
  padding: ${grid(2)};
  padding-top: 0;
  z-index: 101;

  > button {
    font-size: 15px !important;
  }
`

const FilesWrapper = styled.div`
  background: white;
  border-right: 1px solid #0004;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding-right: ${p => (p.expand ? '15px' : '0')};
  padding-top: 15px;
  width: 25dvw;
  max-width: ${p => (p.expand ? '25dvw' : '0')};
  left: 49px;
  position: absolute;
  transition: all 0.5s;
  visibility: ${props => (props.defaultState ? 'visible' : 'hidden')};
  z-index: 99;

  * {
    background: #fff0 !important;
  }

  .ant-tree {
    width: 100%;
  }

  .ant-tree-treenode-disabled {
    color: black !important;
    span {
      color: black !important;
    }
  }

  .ant-tree .ant-tree-switcher-noop {
    padding: 0 10px;
    align-items: center;
    flex: unset;
  }

  .ant-tree .ant-tree-switcher {
    align-self: unset;
    flex: unset;
  }

  [data-icon='folder-add'] {
    margin-top: -5px !important;
  }

  .ant-tree-title {
    align-items: center;
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0;
  }

  .ant-tree-treenode {
    align-items: center;
    display: flex;
    justify-content: space-between;

    &:hover {
      background: #fff0 !important;
      color: var(--color-trois) !important;
    }
  }

  span.ant-tree-node-selected {
    background: #fff0 !important;
  }

  span.ant-tree-node-content-wrapper {
    background: #fff0 !important;
    display: flex !important;
    align-items: center !important;
    padding: 0 !important;
  }

  /*
  .ant-tree-switcher {
  } */

  .ant-tree-draggable-icon {
    cursor: grab;
    opacity: 1 !important;
    span svg {
      fill: var(--color-trois);
      margin: 0 !important;
    }
  }
`

const StyledMainButton = styled(Button)`
  background-color: transparent;
  border-bottom: 1px solid var(--color-trois-alpha) !important;
  border-radius: 0;

  text-decoration: none;
  border: none;
  outline: 0 !important;
  width: fit-content;
  padding: 0;
  padding-top: 5px;
  /* margin-bottom: ${grid(4)}; */

  svg {
    fill: #a34ba1;
    height: 30px;
    padding: 3px 0;
    width: 30px;
    &:active,
    &:focus,
    &:hover {
      fill: #723571;
    }
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
}) => {
  let isFileManagerOpen = true
  if (localStorage.getItem('isFileManagerOpen') !== null) {
    isFileManagerOpen = localStorage.getItem('isFileManagerOpen')
  } else {
    localStorage.setItem('isFileManagerOpen', isFileManagerOpen)
  }

  const [gData, setGData] = useState([])
  const [sharedDocTree, setSharedDocTree] = useState([])
  const [deleteResourceRow, setDeleteResourceRow] = useState(null)
  const [expandFilesArea, setExpandFilesArea] = useState(
    isFileManagerOpen === 'true' ? true : false,
  )
  const [defaultState, setDefaultState] = useState(expandFilesArea)

  // const [expandedKeys] = useState(['0-0', '0-0-0', '0-0-0-0'])

  const onDrop = async info => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]) // the drop position relative to the drop node, inside 0, top -1, bottom 1

    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data)
        }
        if (data[i].children) {
          loop(data[i].children, key, callback)
        }
      }
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
  }, [])

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

  const getActiveDocForDeletion = findChildNodeByIdentifier(
    deleteResourceRow ? [deleteResourceRow] : [],
    currentIdentifier,
  )

  return (
    <>
      <ControlsWrappers>
        <StyledMainButton
          onClick={() =>
            addResourceFn({ variables: { id: null, isFolder: true } })
          }
          title="Add Folder"
        >
          <FolderAddFilled style={{ fontSize: '32px' }} />
        </StyledMainButton>
        <StyledMainButton
          onClick={() =>
            addResourceFn({ variables: { id: null, isFolder: false } })
          }
          title="Add File"
        >
          <FileAddFilled style={{ fontSize: '32px' }} />
        </StyledMainButton>
        <StyledMainButtonExpand
          expand={expandFilesArea.toString()}
          onClick={() => {
            setDefaultState(true)
            localStorage.setItem('isFileManagerOpen', !expandFilesArea)
            setExpandFilesArea(!expandFilesArea)
          }}
          title="Show / Hide Filemanager"
        >
          <VerticalAlignBottomOutlined style={{ fontSize: '32px' }} />
        </StyledMainButtonExpand>
      </ControlsWrappers>
      <FilesWrapper expand={expandFilesArea} defaultState={defaultState}>
        <span style={{ minWidth: '23dvw' }}>
          <Tree
            key="myDocs"
            className="draggable-tree"
            // defaultExpandedKeys={expandedKeys}
            defaultExpandAll
            draggable
            blockNode
            onDrop={onDrop}
            allowDrop={node => {
              if (
                (node.dropPosition <= 0 && node.dropNode.isRoot) ||
                (node.dropPosition === 0 && !node.dropNode.isFolder)
              ) {
                return false
              }

              return true
            }}
            treeData={gData}
            titleRender={rowProps => {
              return (
                <RowRender
                  {...rowProps}
                  confirmDelete={confirmDelete}
                  addResource={addResourceFn}
                  renameResource={renameResourceFn}
                />
              )
            }}
          />

          <SharedTree
            key="sharedDocTree"
            blockNode
            treeData={sharedDocTree}
            titleRender={rowProps => {
              return <RowRender {...rowProps} confirmDelete={confirmDelete} />
            }}
          />
        </span>
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
    </>
  )
}
export default DocTreeManager
