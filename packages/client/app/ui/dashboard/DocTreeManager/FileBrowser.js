/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, { useContext, useEffect, useState } from 'react'
import { Tree } from 'antd'
import { cloneDeep } from 'lodash'
import styled from 'styled-components'
import { AiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { DocumentContext } from '../hooks/DocumentContext'
import RowRender from './RowRender'
import ConfirmDelete from '../../modals/ConfirmDelete'
import { findParentNode, findChildNodeByIdentifier } from './utils'

const FilesWrapper = styled.div`
  background: #fff0;
  border-right: ${p =>
    p.$showRightBorder
      ? '1px solid var(--color-trois-alpha)'
      : '1px solid #fff0'};
  display: flex;
  flex-direction: column;
  height: 100%;
  left: 50px;
  min-width: 25dvw;
  overflow: auto;
  padding: 0 4px 0 0;
  transition: all 0.3s;
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
    align-items: center;
    flex: unset;
    padding: 0 10px;
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
    padding: 0;
    width: 100%;
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
    align-items: center !important;
    background: #fff0 !important;
    display: flex !important;
    padding: 0 !important;
  }

  .ant-tree-draggable-icon {
    cursor: grab;
    display: none !important;
    opacity: 1 !important;

    span svg {
      fill: var(--color-trois);
      margin: 0 !important;
    }
  }
`

const SharedTree = styled(Tree)``

const Files = ({ graphQL }) => {
  const { docId, layout } = useContext(AiDesignerContext)
  const {
    setCurrentDoc,
    setDocTree,
    docTree,
    sharedDocTree,
    setSharedDocTree,
  } = useContext(DocumentContext)

  const {
    getDocTreeData,
    addResource,
    renameResource,
    reorderResource,
    deleteResource,
  } = graphQL ?? {}

  const [deleteResourceRow, setDeleteResourceRow] = useState(null)
  const [selectedDocs, setSelectedDocs] = useState([])

  const onDrop = async info => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

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

    let dragObj
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })
    if (!info.dropToGap) {
      loop(data, dropKey, item => {
        item.children = item.children || []
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
        ar.splice(i, 0, dragObj)
      } else {
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

  return (
    <FilesWrapper expand={layout.userMenu} $showRightBorder={layout.chat}>
      <Tree
        key="myDocs"
        className="draggable-tree"
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
        titleRender={rowProps => (
          <RowRender
            {...rowProps}
            setSelectedDocs={setSelectedDocs}
            isSelected={selectedDocs.includes(rowProps.id)}
            confirmDelete={confirmDelete}
            addResource={addResource}
            renameResource={renameResource}
          />
        )}
      />
      <SharedTree
        key="sharedDocTree"
        blockNode
        treeData={sharedDocTree}
        titleRender={rowProps => <RowRender isSharedFolder {...rowProps} />}
      />
      <ConfirmDelete
        deleteResourceFn={deleteResource}
        deleteResourceRow={deleteResourceRow}
        setDeleteResourceRow={setDeleteResourceRow}
      />
    </FilesWrapper>
  )
}

export default Files
