/* eslint-disable react/prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { EditOutlined } from '@ant-design/icons'
import { grid } from '@coko/client'
import { Link } from 'react-router-dom'
// import { Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { BookGrid } from '../bookGrid'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;

  .ant-spin-container,
  .ant-spin-nested-loading {
    height: 100%;
  }
`

const SectionHeader = styled.div`
  align-items: center;
  box-shadow: 0 6px 6px 1px rgb(180 180 180 / 5%);
  display: flex;
  justify-content: space-between;
  padding: ${grid(4)} clamp(${grid(4)}, 10.4348px + 1.7391vi, ${grid(8)});
  z-index: 1;

  h1 {
    margin: 0;
  }
`

const StyledLink = styled(Link)`
  align-items: center;
  background-color: black;
  border-radius: 3px;
  color: white;
  display: flex;
  font-size: 16px;
  gap: 8px;
  height: 40px;
  padding: ${grid(2)} ${grid(4)};
  text-decoration: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #222;
    color: white;
  }
`

const Dashboard = props => {
  const {
    books,
    booksPerPage,
    onPageChange,
    onClickDelete,
    totalCount,
    currentPage,
    canDeleteBook,
    canUploadBookThumbnail,
    loading,
  } = props

  const { t } = useTranslation(null, { keyPrefix: 'pages.dash' })

  return (
    <Wrapper>
      <SectionHeader>
        <h1>{t('title')}</h1>
        <StyledLink data-test="dashboard-newBook-button" to="/create-book">
          <span>
            <EditOutlined />
          </span>
          <span>{t('actions.newBook')}</span>
        </StyledLink>
      </SectionHeader>

      <BookGrid
        books={books}
        booksPerPage={booksPerPage}
        canDeleteBook={canDeleteBook}
        canUploadBookThumbnail={canUploadBookThumbnail}
        currentPage={currentPage}
        loading={loading}
        onClickDelete={onClickDelete}
        onPageChange={onPageChange}
        totalCount={totalCount}
      />
    </Wrapper>
  )
}

Dashboard.propTypes = {
  loading: PropTypes.bool.isRequired,
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      // cover: PropTypes.string.isRequired,
      title: PropTypes.string,
    }),
  ).isRequired,
  booksPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onClickDelete: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  canDeleteBook: PropTypes.func.isRequired,
  canUploadBookThumbnail: PropTypes.func.isRequired,
}

export default Dashboard
