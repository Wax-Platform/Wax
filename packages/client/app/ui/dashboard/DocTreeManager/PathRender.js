import React, { useContext } from 'react'
import styled from 'styled-components'
import { CleanButton, FlexRow } from '../../_styleds/common'
import {
  ArrowLeftOutlined,
  FolderAddOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'
import { DocumentContext } from '../hooks/DocumentContext'
import Each from '../../component-ai-assistant/utils/Each'
import { NewFileButton } from '../../menu/menuOptions'
import { takeRight } from 'lodash'

const MAX_PATH_LEVEL = 4

const PathRenderWrapper = styled.div`
  align-items: center;
  background: #fff0;
  color: var(--color-trois-opaque);
  display: flex;
  font-size: 14px;
  gap: 6px;
  justify-content: space-between;
  width: 100%;

  button {
    color: var(--color-trois-opaque);

    &:hover {
      background-color: var(--color-trois-lightest);
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

  &:hover {
    background: #0003;
  }
`
const Container = styled.div`
  align-items: center;
  background: var(--color-trois-lightest);
  border-radius: 1.5rem;
  display: flex;
  gap: 2px;
  justify-content: flex-start;
  overflow-x: auto;
  padding: 6px 8px;
  width: 100%;
`

const Actions = styled(FlexRow)`
  background: var(--color-trois-lightest);
  border-radius: 1.5rem;
  gap: 8px;
  padding: 7px 10px;
`

const PathRender = () => {
  const { currentPath, graphQL, createResource } = useContext(DocumentContext)
  const { openFolder } = graphQL ?? {}
  const { pathNames, pathIds } = currentPath ?? {}
  const { length: pathLevel } = pathNames ?? []

  const lastPaths = takeRight(pathNames, MAX_PATH_LEVEL)
  const lastPathIds = takeRight(pathIds, MAX_PATH_LEVEL)
  const isClamped = pathLevel > MAX_PATH_LEVEL
  const { length: currentLevel } = lastPaths ?? []

  const pathRender = (folderName, i) => {
    const displayPathSeparator = i !== currentLevel - 1 || currentLevel === 1
    const pathName = i === 0 ? (isClamped ? '...' : '.') : folderName
    return (
      <PathButton
        $active={i === currentLevel - 1}
        onClick={() => {
          const variables = { id: lastPathIds[i] }
          openFolder({ variables })
        }}
      >
        <span>{pathName}</span>
        {displayPathSeparator && <span>{'/'}</span>}
      </PathButton>
    )
  }

  const goBack = () => {
    const previousPathId = lastPathIds[currentLevel - 2]
    openFolder({ variables: { id: previousPathId } })
  }

  return (
    <PathRenderWrapper>
      <Container>
        <Each of={lastPaths} as={pathRender} if={pathLevel} />
      </Container>
      <Actions>
        <CleanButton onClick={createResource()}>
          <PlusCircleOutlined style={{ fontSize: '15px' }} />
        </CleanButton>
        <CleanButton onClick={createResource(true)}>
          <FolderAddOutlined style={{ fontSize: '18px' }} />
        </CleanButton>
        <CleanButton $disabled={pathLevel === 1} onClick={goBack}>
          <ArrowLeftOutlined />
        </CleanButton>
      </Actions>
    </PathRenderWrapper>
  )
}

export default PathRender
