/* stylelint-disable string-quotes */
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid } from '@coko/client'
import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import BookCard from './BookCard'
import { List } from '../common'

const StyledList = styled(List)`
  ul.ant-list-items {
    display: grid;
    gap: 3em;
    grid-template-columns: repeat(1, minmax(200px, 1fr));
    padding: ${grid(8)} ${grid(8)} ${grid(20)};

    @media (min-width: 500px) {
      grid-template-columns: repeat(2, minmax(190px, 1fr));
    }

    @media (min-width: 750px) {
      grid-template-columns: repeat(3, minmax(200px, 1fr));
    }

    @media (min-width: 1000px) {
      grid-template-columns: repeat(4, minmax(200px, 1fr));
    }

    @media (min-width: 1500px) {
      grid-template-columns: repeat(6, minmax(200px, 1fr));
    }
  }

  [data-gridview='false'] {
    ul.ant-list-items {
      gap: 0;
      grid-template-columns: 1fr;
      margin-inline: auto;
      max-width: 120ch;
    }
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 72px);

  > * + * {
    margin-block-start: ${grid(4)};
  }
`

const BookGrid = ({
  books,
  booksPerPage,
  onPageChange,
  onClickDelete,
  totalCount,
  currentPage,
  loading,
  canDeleteBook,
  canUploadBookThumbnail,
}) => {
  const paginationConfig = {
    pageSize: booksPerPage,
    current: currentPage,
    showSizeChanger: false,
    onChange: onPageChange,
  }

  const { t } = useTranslation()

  return (
    <Wrapper>
      <StyledList
        dataSource={books}
        itemLayout="horizontal"
        loading={loading}
        locale={{
          emptyText: (
            <Empty
              description={<span>{t('pages.dash.empty')}</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        pagination={paginationConfig}
        renderItem={book => (
          <BookCard
            {...book}
            canDeleteBook={canDeleteBook}
            canUploadBookThumbnail={canUploadBookThumbnail}
            onClickDelete={onClickDelete}
            showActions
          />
        )}
        showPagination={totalCount > 10}
        totalCount={totalCount}
      />
    </Wrapper>
  )
}

BookGrid.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      cover: PropTypes.arrayOf(
        PropTypes.shape({
          coverUrl: PropTypes.string,
        }),
      ),
      title: PropTypes.string,
    }),
  ),
  booksPerPage: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  onClickDelete: PropTypes.func.isRequired,
  totalCount: PropTypes.number,
  currentPage: PropTypes.number.isRequired,
  canDeleteBook: PropTypes.func.isRequired,
  canUploadBookThumbnail: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}

BookGrid.defaultProps = {
  books: [],
  booksPerPage: 12,
  totalCount: 0,
}

export default BookGrid
