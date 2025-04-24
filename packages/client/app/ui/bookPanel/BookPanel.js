import React from 'react'
import PropTypes from 'prop-types'
import { CloudUploadOutlined, PlusOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { grid } from '@coko/client'
import { Space } from 'antd'
import { useTranslation } from 'react-i18next'

import ChapterList from './ChapterList'
import { Button } from '../common'

const ChaptersArea = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  width: 100%;
`

const ChaptersHeader = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-bottom: ${grid(2)};
  padding: ${grid(1)};
  width: 100%;

  button {
    border-radius: 0;
  }
`

const ChaptersActions = styled(Space)``

const StyledHeading = styled.div`
  font-weight: bold;
  text-transform: capitalize;
  width: 85%;
`

const IconWrapper = styled(Button)`
  cursor: pointer;
`

const BookPanel = props => {
  const {
    className,
    chapters,
    onDeleteChapter,
    onChapterClick,
    selectedChapterId,
    onReorderChapter,
    onAddChapter,
    onUploadChapter,
    chaptersActionInProgress,
    canEdit,
    onBookComponentTypeChange,
    onBookComponentParentIdChange,
  } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.producer.bookBodySidebar',
  })
  // TO RE-DO: Do no show meta data form if chapters are being processed

  return (
    <ChaptersArea className={className}>
      <ChaptersHeader>
        <StyledHeading>{t('title')}</StyledHeading>
        <ChaptersActions>
          <IconWrapper
            aria-label={t('actions.upload')}
            disabled={!canEdit}
            icon={<CloudUploadOutlined />}
            onClick={onUploadChapter}
            title={t('actions.upload')}
            type="text"
          />
          <IconWrapper
            aria-label={t('actions.create')}
            data-test="producer-createChapter-btn"
            disabled={!canEdit}
            icon={<PlusOutlined />}
            onClick={onAddChapter}
            title={t('actions.create')}
            type="text"
          />
        </ChaptersActions>
      </ChaptersHeader>
      <ChapterList
        canEdit={canEdit}
        chapters={chapters}
        chaptersActionInProgress={chaptersActionInProgress}
        onBookComponentParentIdChange={onBookComponentParentIdChange}
        onBookComponentTypeChange={onBookComponentTypeChange}
        onChapterClick={onChapterClick}
        onDeleteChapter={onDeleteChapter}
        onReorderChapter={onReorderChapter}
        selectedChapterId={selectedChapterId}
      />
    </ChaptersArea>
  )
}

BookPanel.propTypes = {
  chapters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      lockedBy: PropTypes.string,
    }),
  ),
  onDeleteChapter: PropTypes.func.isRequired,
  selectedChapterId: PropTypes.string,
  onAddChapter: PropTypes.func.isRequired,
  onChapterClick: PropTypes.func.isRequired,
  onUploadChapter: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onReorderChapter: PropTypes.func.isRequired,
  chaptersActionInProgress: PropTypes.bool.isRequired,
  onBookComponentTypeChange: PropTypes.func,
  onBookComponentParentIdChange: PropTypes.func,
}
BookPanel.defaultProps = {
  chapters: [],
  selectedChapterId: undefined,
  onBookComponentTypeChange: null,
  onBookComponentParentIdChange: null,
}

export default BookPanel
