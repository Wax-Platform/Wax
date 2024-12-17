/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable rule-empty-line-before */
/* stylelint-disable declaration-no-important */
/* stylelint-disable order/properties-alphabetical-order */
import React, { useContext, useEffect, useState } from 'react'
import { Tree } from 'antd'
import { cloneDeep } from 'lodash'
import styled from 'styled-components'
import { grid, uuid } from '@coko/client'
import {
  FolderOpenFilled,
  FolderFilled,
  FileAddOutlined,
} from '@ant-design/icons'
import RowRender from './RowRender'
import ConfirmDelete from '../../modals/ConfirmDelete'
import { findParentNode, findChildNodeByIdentifier } from './utils'
import { AiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { DocumentContext } from '../hooks/DocumentContext'
import { CleanButton, WindowHeading } from '../../_styleds/common'
import { useDocTree } from '../hooks/useDocTree'
import TeamPopup from '../../common/TeamPopup'
import { useHistory } from 'react-router-dom'

const Menu = styled.div`
  background: #f2eff5;
  box-shadow: inset 0 0 5px #0002;
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100%;
  width: 50px;
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
  padding: 0;
  width: 25dvw;
  max-width: ${p => (p.expand ? '25dvw' : '0')};
  left: 50px;
  position: absolute;
  transition: all 0.3s;
  visibility: ${props => (props.defaultState ? 'visible' : 'hidden')};
  z-index: 999;

  .ant-tree {
    background: #fff0 !important;
    padding: 0 8px 0 5px;
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
  .ant-tree-list-holder-inner {
    > :first-child {
      .ant-tree-draggable-icon {
        cursor: grab;
        opacity: 0 !important;
        span svg {
          fill: var(--color-trois);
          margin: 0 !important;
        }
      }
    }
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
    padding: 0 !important;

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
    display: none !important;
    span svg {
      fill: var(--color-trois);
      margin: 0 !important;
    }
  }
`

const StyledMainButton = styled(CleanButton)`
  backdrop-filter: brightness(${p => (p.$expanded ? '103%' : '100%')});
  border-bottom: 1px solid var(--color-trois-alpha) !important;
  border-radius: 0;
  text-decoration: none;
  transition: backdrop-filter 0.5s;
  width: 100%;
  height: 45px;
  padding: 5px;

  /* margin-bottom: ${grid(4)}; */
  &:hover {
    backdrop-filter: brightness(105%);
  }
  svg {
    fill: #a34ba1;
    height: 30px;
    padding: 3px 0;
    width: 30px;
  }
  a svg {
    height: 28px;
    width: 28px;
  }
`

const SharedTree = styled(Tree)``

const Heading = styled(WindowHeading)`
  background-color: var(--color-trois-lightest);
  width: 100%;
  border-bottom: 1px solid var(--color-trois-alpha);

  span {
    color: #333 !important;
    text-transform: uppercase;
  }
`

const DocTreeManager = ({ enableLogin }) => {
  let isFileManagerOpen = true
  if (localStorage.getItem('isFileManagerOpen') !== null) {
    isFileManagerOpen = localStorage.getItem('isFileManagerOpen')
  } else {
    localStorage.setItem('isFileManagerOpen', isFileManagerOpen)
  }

  const { docId } = useContext(AiDesignerContext)
  const {
    setCurrentDoc,
    setDocTree,
    docTree,
    sharedDocTree,
    setSharedDocTree,
  } = useContext(DocumentContext)

  const history = useHistory()

  const {
    getDocTreeData,
    addResource,
    renameResource,
    reorderResource,
    deleteResource,
  } = useDocTree()
  const [deleteResourceRow, setDeleteResourceRow] = useState(null)
  const [expandFilesArea, setExpandFilesArea] = useState(
    isFileManagerOpen === 'true' ? true : false,
  )
  const [defaultState, setDefaultState] = useState(expandFilesArea)

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
    const data = [...docTree]

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
    setDocTree(data)

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
    if (allData.length < 1) return
    allData[0].isRoot = true

    setDocTree([...allData])

    const sharedData = cloneDeep(data.getSharedDocTree)
    sharedData[0].isRoot = true

    setSharedDocTree([...sharedData])
  }, [])

  const confirmDelete = row => {
    setDeleteResourceRow(row)
  }

  useEffect(() => {
    const currentDocument = findChildNodeByIdentifier(docTree, docId)
    currentDocument && setCurrentDoc(currentDocument)
  }, [docTree])

  const parts = window.location.href.split('/')
  const currentIdentifier = parts[parts.length - 1]

  const getActiveDocForDeletion = findChildNodeByIdentifier(
    deleteResourceRow ? [deleteResourceRow] : [],
    currentIdentifier,
  )

  const handleCreateNewDoc = () => {
    const id = uuid()
    addResource({ variables: { id, isFolder: false } }).then(
      ({ data: { addResource } }) => {
        console.log('addResource', addResource)
        setCurrentDoc(addResource)
        history.push(`/${addResource.identifier}`, { replace: true })
      },
    )
  }
  return (
    <>
      {/* TODO: move menu outside this component, it should also have all other Options (AI chat,images,templates,snippets,etc) */}
      <Menu>
        <StyledMainButton
          $expanded={expandFilesArea}
          onClick={() => {
            setDefaultState(true)
            localStorage.setItem('isFileManagerOpen', !expandFilesArea)
            setExpandFilesArea(!expandFilesArea)
          }}
          title="Show / Hide Filemanager"
        >
          {!expandFilesArea ? (
            <FolderFilled style={{ fontSize: '32px' }} />
          ) : (
            <FolderOpenFilled style={{ fontSize: '32px' }} />
          )}
        </StyledMainButton>
        <StyledMainButton title="New File">
          <CleanButton onClick={handleCreateNewDoc}>
            <FileAddOutlined style={{ fontSize: '25px' }} />
          </CleanButton>
        </StyledMainButton>
        <StyledMainButton>
          <TeamPopup enableLogin={enableLogin} />
        </StyledMainButton>
      </Menu>
      <FilesWrapper expand={expandFilesArea} defaultState={defaultState}>
        <span style={{ minWidth: '23dvw' }}>
          <Heading>
            <span>Explorer</span>
          </Heading>
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
            treeData={docTree}
            titleRender={rowProps => {
              return (
                <RowRender
                  {...rowProps}
                  confirmDelete={confirmDelete}
                  addResource={addResource}
                  renameResource={renameResource}
                />
              )
            }}
          />

          <SharedTree
            key="sharedDocTree"
            blockNode
            treeData={sharedDocTree}
            titleRender={rowProps => {
              return (
                <RowRender
                  isSharedFolder
                  {...rowProps}
                  // confirmDelete={confirmDelete}
                  // addResource={addResourceFn}
                  // renameResource={renameResourceFn}
                />
              )
            }}
          />
        </span>
      </FilesWrapper>
      <ConfirmDelete
        deleteResourceFn={deleteResource}
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
