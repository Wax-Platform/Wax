/* stylelint-disable value-list-comma-newline-after */
/* stylelint-disable string-quotes */
import React from 'react'
import {
  DeleteOutlined,
  MoreOutlined,
  FileImageOutlined,
} from '@ant-design/icons'
import { Card } from 'antd'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid, th } from '@coko/client'
import { useTranslation } from 'react-i18next'
import Popup from '@coko/client/dist/ui/common/Popup'
import { LinkWithoutStyles, Button } from '../common'
import BookCover from './BookCover'

const { Meta } = Card

const StyledDeleteOutlined = styled(DeleteOutlined)`
  color: ${th('colorError')};
`

const StyledLink = styled(LinkWithoutStyles)`
  overflow: hidden;
  white-space: nowrap;

  &::before {
    content: '';
    inset: 0;
    position: absolute;
  }
`

const StyledCard = styled(Card)`
  position: relative;
  width: 100%;

  .ant-card-body {
    padding: ${grid(2)} ${grid(1)} ${grid(2)} ${grid(3)};
  }

  &[data-gridview='false'] {
    display: flex;
    height: 60px;
    margin-block-start: 2px;

    .ant-card-cover {
      flex-basis: 10%;
      min-width: 60px;
    }

    > :last-child {
      display: inline-flex;
      flex-grow: 1;
    }
  }

  &:has(a:focus-visible) {
    outline: 2px solid ${th('colorOutline')};
  }
`

const TitleAndActionsWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;

  a:focus-visible {
    /* stylelint-disable-next-line declaration-no-important */
    outline: none !important;
  }
`

const MoreActions = styled.div`
  button {
    border-radius: 0;
    z-index: 1;
  }
`

const PopupContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 2;

  > * {
    display: flex;
    gap: 8px;
    margin: 0;
    padding: 4px;

    &:focus,
    &:hover {
      background-color: rgb(105 105 105 / 4%);
      color: inherit;
      outline: none;
    }

    button {
      flex-grow: 1;
      padding: 0;
      text-align: start;
    }

    span[data-disabled='true'] {
      opacity: 0.4;
    }
  }
`

const StyledPopup = styled(Popup)`
  border: medium;
  border-radius: 0;
  box-shadow: 0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%),
    0 9px 28px 8px rgb(0 0 0 / 5%);
  margin-top: 0;
  padding: 5px;
`

const DisabledPlaceholder = styled.span`
  color: rgb(85 85 85 / 25%);
  cursor: not-allowed;
  white-space: nowrap;
`

const BookCard = ({
  cover,
  id,
  onClickDelete,
  showActions,
  title,
  canDeleteBook,
  canUploadBookThumbnail,
  gridView,
}) => {
  const { t } = useTranslation(null, { keyPrefix: 'pages.dash.book' })

  return (
    <StyledCard
      cover={<BookCover src={cover && cover[0]?.coverUrl} title={title} />}
      data-gridview={gridView}
      hoverable
      size="small"
    >
      <TitleAndActionsWrapper>
        <StyledLink to={`/books/${id}/producer`}>
          <Meta title={title || t('untitled')} />
        </StyledLink>
        {showActions && (
          <MoreActions>
            <StyledPopup
              alignment="end"
              focusableContent={['button']}
              id={`more-actions-${id}`}
              position="block-end"
              toggle={<Button icon={<MoreOutlined />} type="text" />}
            >
              <PopupContentWrapper>
                <div>
                  <FileImageOutlined data-disabled={!canDeleteBook(id)} />
                  {canUploadBookThumbnail(id) ? (
                    <StyledLink
                      style={{}}
                      to={`/books/${id}/producer#metadata`}
                    >
                      {t('menu.options.manageMetadata')}
                    </StyledLink>
                  ) : (
                    <DisabledPlaceholder>
                      {t('menu.options.manageMetadata')}
                    </DisabledPlaceholder>
                  )}
                </div>
                <div>
                  <StyledDeleteOutlined data-disabled={!canDeleteBook(id)} />
                  <Button
                    disabled={!canDeleteBook(id)}
                    onClick={() => {
                      document
                        .querySelector(`[aria-controls="more-actions-${id}"`)
                        .click()
                      onClickDelete(id)
                    }}
                    type="text"
                  >
                    {t('menu.options.delete')}
                  </Button>
                </div>
              </PopupContentWrapper>
            </StyledPopup>
          </MoreActions>
        )}
      </TitleAndActionsWrapper>
    </StyledCard>
  )
}

BookCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  cover: PropTypes.arrayOf(
    PropTypes.shape({
      coverUrl: PropTypes.string,
    }),
  ),
  showActions: PropTypes.bool,
  onClickDelete: PropTypes.func,
  canDeleteBook: PropTypes.func.isRequired,
  canUploadBookThumbnail: PropTypes.func.isRequired,
  gridView: PropTypes.bool,
}

BookCard.defaultProps = {
  title: 'Untitled',
  cover: null,
  showActions: false,
  onClickDelete: () => {},
  gridView: true,
}

export default BookCard
