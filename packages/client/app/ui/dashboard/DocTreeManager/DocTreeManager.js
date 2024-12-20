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
  TeamOutlined,
  FolderOutlined,
  FolderOpenOutlined,
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
import ChatHistory from '../../component-ai-assistant/ChatHistory'
import aiIcon from '../../../../static/chat-icon.svg'

const Menu = styled.div`
  background: var(--color-trois-lightest-2);
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100%;
  gap: 5px;
  width: 50px;
  padding-left: 10px;
  padding-top: 12px;
  z-index: 101;

  > button {
    font-size: 15px !important;
  }
`

const FilesWrapper = styled.div`
  background: #fff0;
  display: flex;
  border-right: ${p =>
    p.$showRightBorder
      ? '1px solid var(--color-trois-alpha)'
      : '1px solid #fff0'};
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: 0 4px 0 0;
  min-width: 25dvw;
  /* max-width: ${p => (p.expand ? '26dvw' : '0')}; */
  left: 50px;
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
  --shadow: ${p => (p.$expanded ? '#0001' : '#0000')};
  aspect-ratio: 1 / 1;
  box-shadow: inset 0 0 2px 0 var(--shadow);
  background-color: ${p => (p.$expanded ? '#00000005' : '#00000000')};
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
  height: fit-content;

  &:hover {
    background-color: #00000005;
  }
  svg {
    fill: ${p =>
      p.$expanded ? 'var(--color-trois-dark)' : 'var(--color-trois)'};
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
  background: #fff0;
  border-right: ${p =>
    p.$showRightBorder
      ? '1px solid var(--color-trois-alpha)'
      : '1px solid #fff0'};
  padding: 17px 10px;
  width: 100%;

  span {
    border-radius: 1.5rem;
    color: #0007 !important;
    font-size: 18px;
    font-weight: 200;
    background: #00000005;
    padding: 8px 15px;
  }
`

const DocTreeManager = ({ enableLogin }) => {
  const { docId, layout, updateLayout, designerOn } =
    useContext(AiDesignerContext)
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
  const menuLabel = layout.files
    ? 'Files'
    : layout.chat
    ? 'Chat'
    : layout.team
    ? 'Team'
    : null
  return (
    <>
      {/* TODO: move menu outside this component, it should also have all other Options (AI chat,images,templates,snippets,etc) */}
      <Menu>
        <StyledMainButton
          $expanded={layout.userMenu && layout.files}
          onClick={() => {
            layout.files && layout.userMenu
              ? updateLayout({ userMenu: false })
              : updateLayout({
                  files: true,
                  chat: false,
                  team: false,
                  userMenu: true,
                })
          }}
          title="Show / Hide Filemanager"
        >
          {!layout.files ? (
            <FolderOutlined style={{ fontSize: '32px' }} />
          ) : (
            <FolderOpenOutlined style={{ fontSize: '32px' }} />
          )}
        </StyledMainButton>
        <StyledMainButton onClick={handleCreateNewDoc} title="New File">
          <FileAddOutlined style={{ fontSize: '25px' }} />
        </StyledMainButton>
        <StyledMainButton
          $expanded={layout.userMenu && layout.team}
          title="Team"
        >
          <TeamOutlined
            onClick={() =>
              layout.team && layout.userMenu
                ? updateLayout({ userMenu: false })
                : updateLayout({
                    team: true,
                    chat: false,
                    files: false,
                    userMenu: true,
                  })
            }
          />
        </StyledMainButton>
        {designerOn && (
          <StyledMainButton
            $expanded={layout.userMenu && layout.chat}
            onClick={() =>
              layout.chat && layout.userMenu
                ? updateLayout({ userMenu: false })
                : updateLayout({
                    chat: true,
                    files: false,
                    team: false,
                    userMenu: true,
                  })
            }
          >
            <img style={{ width: '25px' }} src={aiIcon} alt="AI" />
          </StyledMainButton>
        )}
      </Menu>
      <span
        style={{
          maxWidth:
            !layout.userMenu || (!layout.chat && !layout.files && !layout.team)
              ? '0'
              : '25dvw',
          width: '25dvw',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s',
          overflow: 'hidden',
          background: '#fff0',
          zIndex: 999,
        }}
      >
        <Heading $showRightBorder={layout.chat}>
          {menuLabel && <span>{menuLabel}</span>}
        </Heading>
        <FilesWrapper expand={layout.userMenu} $showRightBorder={layout.chat}>
          {layout.files ? (
            <>
              <Tree
                key="myDocs"
                className="draggable-tree"
                // defaultExpandedKeys={expandedKeys}
                // defaultExpandAll
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
            </>
          ) : layout.chat ? (
            <ChatHistory />
          ) : layout.team ? (
            <TeamPopup enableLogin={enableLogin} open={layout.team} />
          ) : null}
        </FilesWrapper>
      </span>
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
