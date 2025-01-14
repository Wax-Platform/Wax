/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, { useContext, useState } from 'react'
import { Tree } from 'antd'
import styled from 'styled-components'
import { AiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { DocumentContext } from '../hooks/DocumentContext'
import RowRender from './RowRender'
import ConfirmDelete from '../../modals/ConfirmDelete'

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

const Files = props => {
  const { layout } = useContext(AiDesignerContext)
  const { currentFolder, graphQL } = useContext(DocumentContext)

  const {
    addResource,
    renameResource,
    reorderResource,
    deleteResource,
    openFolder,
  } = graphQL ?? {}

  const [deleteResourceRow, setDeleteResourceRow] = useState(null)
  const [selectedDocs, setSelectedDocs] = useState([])

  const onDrop = async info => {
    const newParentId = info.node.key
    const id = info.dragNode.key
    reorderResource({ variables: { id, newParentId } })
  }

  const confirmDelete = row => {
    setDeleteResourceRow(row)
  }

  return (
    <FilesWrapper
      expand={layout.userMenu}
      $showRightBorder={layout.chat}
      {...props}
    >
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
        treeData={currentFolder?.children || []}
        titleRender={rowProps => (
          <RowRender
            {...rowProps}
            openFolder={openFolder}
            isSelectedAlready={selectedDocs}
            isSelected={selectedDocs.includes(rowProps.id)}
            confirmDelete={confirmDelete}
            addResource={addResource}
            renameResource={renameResource}
            selectedDocs={selectedDocs}
            setSelectedDocs={setSelectedDocs}
          />
        )}
      />
      {/* {!currentFolder?.parentId && (
        <SharedTree
          key="sharedDocTree"
          blockNode
          treeData={sharedDocTree}
          titleRender={rowProps => <RowRender isSharedFolder {...rowProps} />}
        />
      )} */}
      <ConfirmDelete
        deleteResourceFn={deleteResource}
        deleteResourceRow={deleteResourceRow}
        setDeleteResourceRow={setDeleteResourceRow}
      />
    </FilesWrapper>
  )
}

export default Files
