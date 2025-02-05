/* stylelint-disable no-descending-specificity */
import React, { useContext } from 'react'
import styled from 'styled-components'
import { CleanButton, FlexRow } from '../../_styleds/common'
import {
  ArrowLeftOutlined,
  FolderAddOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'
import { useDocumentContext } from '../hooks/DocumentContext'
import Each from '../../component-ai-assistant/utils/Each'
import { takeRight } from 'lodash'
import { useAiDesignerContext } from '../../component-ai-assistant/hooks/AiDesignerContext'
import { typeFlags } from './utils/resourcesUtils'
import { TemplateManagerHeader } from '../../component-ai-assistant/components/CodeEditor'
import {
  useCreateDoc,
  useCreateFolder,
  useCreateSnippet,
} from '../../component-ai-assistant/SnippetsManager'

const MAX_PATH_LEVEL = 4

const PathRenderWrapper = styled.div`
  align-items: center;
  background: #fff0;
  color: var(--color-trois-opaque);
  display: flex;
  font-size: 14px;
  gap: 6px;
  justify-content: space-between;
  padding-inline: 4px;
  user-select: none;
  width: 100%;

  button {
    color: var(--color-trois-opaque-2);

    &:hover {
      background-color: #0001;
    }

    svg {
      fill: var(--color-trois-opaque);
    }
  }
`

const PathButton = styled(CleanButton)`
  font-weight: ${p => (p.$active ? '600' : 'normal')};
  padding: 2px 0;
  transition: all 0.2s;
`
const Container = styled.div`
  align-items: center;
  background: var(--color-trois-lightest);
  border-radius: 1.5rem;
  display: flex;
  gap: 2px;
  justify-content: flex-start;
  overflow-x: ${p => (p.$hiding ? 'hidden' : 'auto')};
  padding: 6px 15px;
  width: 100%;
`

export const Actions = styled(FlexRow)`
  background: var(--color-trois-lightest);
  border-radius: 1.5rem;
  color: var(--color-trois-opaque-2);
  gap: 8px;
  padding: 7px 10px;

  &:hover {
    background-color: #0001;
  }

  svg {
    fill: var(--color-trois-opaque);
  }
`

const createFolderIsChecker = folder => extension =>
  folder?.extension === extension

const CANT_CREATE = ['Templates', 'Favorites', 'Shared', 'Snippets']

const PathRender = props => {
  const { layout } = useAiDesignerContext()
  const { currentPath, graphQL, currentFolder } = useDocumentContext()
  const handleCreateSnippet = useCreateSnippet()
  const handleCreateDoc = useCreateDoc()
  const handleCreateFolder = useCreateFolder()

  const { openFolder } = graphQL ?? {}
  const { length: pathLevel } = currentPath ?? []
  const isClamped = pathLevel > MAX_PATH_LEVEL

  const { isSystem, isRoot } = typeFlags(currentFolder?.resourceType)
  const folderIs = createFolderIsChecker(currentFolder)

  const isSpecialFolder = CANT_CREATE.includes(currentFolder?.title) && isSystem
  const canCreateDoc = !currentFolder?.extension && !isRoot
  const canCreate = !isSpecialFolder && !isRoot

  const lastPaths = takeRight(currentPath, MAX_PATH_LEVEL)
  const { length: currentLevel } = lastPaths ?? []

  const pathRender = ({ title, id }, i) => {
    const displayPathSeparator = i !== currentLevel - 1 || currentLevel === 1
    const pathName = i === 0 ? (isClamped ? '...' : '.') : title
    return (
      <PathButton
        $active={i === currentLevel - 1}
        onClick={() => {
          const variables = { id }
          openFolder({ variables })
        }}
      >
        <span>{pathName}</span>
        {displayPathSeparator && <span>{'/'}</span>}
      </PathButton>
    )
  }

  const goBack = () => {
    const { id } = lastPaths[currentLevel - 2] ?? {}
    openFolder({ variables: { id } })
  }

  return (
    <PathRenderWrapper {...props}>
      <Container $hiding={!layout.userMenu}>
        <Each of={lastPaths} as={pathRender} if={pathLevel} />
      </Container>
      <Actions>
        {canCreate && (
          <>
            {canCreateDoc && (
              <CleanButton onClick={handleCreateDoc}>
                <PlusCircleOutlined style={{ fontSize: '15px' }} />
              </CleanButton>
            )}
            {currentFolder?.extension === 'snip' && (
              <CleanButton onClick={handleCreateSnippet}>
                <PlusCircleOutlined style={{ fontSize: '15px' }} />
              </CleanButton>
            )}
            <CleanButton onClick={handleCreateFolder}>
              <FolderAddOutlined style={{ fontSize: '18px' }} />
            </CleanButton>
          </>
        )}
        {(folderIs('template') || currentFolder?.extension === 'template') && (
          <TemplateManagerHeader />
        )}
        <CleanButton $disabled={pathLevel === 1} onClick={goBack}>
          <ArrowLeftOutlined />
        </CleanButton>
      </Actions>
    </PathRenderWrapper>
  )
}

export default PathRender
