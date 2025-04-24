/* eslint-disable no-param-reassign */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable string-quotes */
/* stylelint-disable value-list-comma-newline-after */
import React, { useEffect, forwardRef, useRef } from 'react'
import PropTypes from 'prop-types'
import { HolderOutlined, MoreOutlined } from '@ant-design/icons'
import styled, { keyframes } from 'styled-components'
import Popup from '@coko/client/dist/ui/common/Popup'
import { grid, th } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { Button } from '../common'

const animation = keyframes`
  0% { opacity: 1; }

  50% { opacity: 0; }

  100% { opacity: 1; }
`

const StyledHolderOutlined = styled(HolderOutlined)`
  && {
    cursor: grab;
  }
`

const InnerWrapper = styled.div`
  --vertical-padding: 0;

  align-items: center;
  border-inline-start: 2px solid transparent;
  box-sizing: border-box;
  color: ${th('colorText')};
  display: flex;
  padding: var(--vertical-padding) 2px;
  position: relative;
  transition: border-inline-start-color 0.1s ease, background-color 0.1s ease;

  &[data-selected='true'] {
    background-color: #3f85c655;
    border-inline-start-color: ${th('colorOutline')};
  }

  > :first-child {
    align-self: stretch;
    margin-block: ${grid(1)};
    padding-inline: ${grid(1)};
  }

  > :last-child {
    margin-inline-start: auto;
  }
`

const Chapter = styled.div`
  cursor: pointer;
  list-style: none;
  outline-offset: -2px;
  padding-left: var(--spacing);

  &[data-clone='true'] {
    display: inline-block;
    pointer-events: none;

    ${InnerWrapper} {
      --vertical-padding: 0;
      border-radius: 4px;
      box-shadow: 0 15px 15px 0 rgba(34 33 81 10%);
      padding-right: 24px;
    }
  }

  &[data-ghost='true'] {
    &:not(.indicator) {
      opacity: 0.5;
    }

    ${InnerWrapper} {
      > * {
        background-color: transparent;
        box-shadow: none;
      }
    }
  }

  &[data-disableinteraction='true'] {
    pointer-events: none;
  }

  &[data-disableselection='true'] {
    .Text,
    .Count {
      user-select: none;
    }
  }

  &[data-uploading='true'] {
    animation: ${animation} 2s infinite;
  }

  &[data-part='true'][data-ghost='false'] {
    > div {
      margin-block-end: 36px;
      position: relative;

      &::after {
        background-color: #eee;
        color: #777;
        content: 'Drop chapters inside part';
        display: grid;
        height: 36px;
        inset-block-start: 36px;
        margin-inline-start: 33px;
        place-content: center;
        position: absolute;
        width: calc(100% - 36px);
      }
    }
  }

  &:hover [data-selected='false'] {
    background-color: ${th('colorBackgroundHue')};
  }

  &:hover,
  &:focus-within {
    [aria-haspopup='dialog'] {
      opacity: 1;
    }
  }
`

const UserAvatar = styled.div`
  align-items: center;
  background-color: #e9e71b;
  border-radius: 50%;
  color: #3e3e3e;
  display: flex;
  font-size: 14px;
  font-weight: bold;
  height: ${grid(6)};
  justify-content: center;
  margin-left: ${grid(2)};
  width: ${grid(6)};
`

const ChapterTitle = styled.div`
  flex: 1;

  &[data-status='300'] {
    color: ${th('colorError')};
    font-weight: bold;

    &::before {
      content: '!! ';
    }

    &::after {
      content: ' !!';
    }
  }

  max-width: 280px;
  overflow: hidden;
  padding: 10px 0 10px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:focus,
  &:focus-visible {
    /* stylelint-disable-next-line declaration-no-important */
    outline: none !important;
  }
`

const MoreActions = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.1s ease;
`

const StyledPopup = styled(Popup)`
  border: medium;
  border-radius: 0;
  box-shadow: 0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%),
    0 9px 28px 8px rgb(0 0 0 / 5%);
  inset-block-start: ${grid(3)};
  inset-inline-end: ${grid(-1)};
  margin-block-start: ${grid(3)};
  padding: ${grid(1)};
`

const PopupContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(2)};

  > * {
    background-color: transparent;
    border: none;
    border-radius: 0;
    padding: 0 12px;
    text-align: start;

    &:focus {
      outline: none;
    }
  }
`

const getInitials = fullname => {
  const deconstructName = fullname.split(' ')
  return `${deconstructName[0][0].toUpperCase()}${
    deconstructName[1][0] && deconstructName[1][0].toUpperCase()
  }`
}

const ChapterItem = forwardRef(
  (
    {
      /* eslint-disable react/prop-types */
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      onRemove,
      style,
      wrapperRef,
      /* eslint-enable react/prop-types */
      // old props
      title,
      lock,
      id,
      isDragging,
      isPart,
      // onClickDuplicate,
      onChapterClick,
      onChapterConvert,
      onClickDelete,
      selectedChapterId,
      uploading,
      status,
      canEdit,
      focused,
      collapseOtherParts,
      ...rest
    },
    ref,
  ) => {
    const chapterRef = useRef(null)

    const { t } = useTranslation(null, {
      keyPrefix: 'pages.producer.bookBodySidebar.chapter',
    })

    useEffect(() => {
      // apply focus if current element recieves `focused=true`
      // and the focus is within the chapter list (current element's parent's parent)
      if (
        focused &&
        chapterRef?.current?.parentElement.parentElement.contains(
          document.activeElement,
        )
      ) {
        chapterRef?.current?.focus()
      }
    }, [focused])

    if (isPart) {
      // if part, modify handle's onKeyDown to collapse other parts too
      /* eslint-disable react/prop-types */
      const { onKeyDown } = handleProps

      handleProps.onKeyDown = e => {
        e.key === ' ' && collapseOtherParts()
        onKeyDown(e)
      }
    }

    return (
      <div ref={wrapperRef}>
        <Chapter
          data-clone={clone}
          data-disableinteraction={disableInteraction}
          data-disableselection={disableSelection}
          data-ghost={ghost}
          data-part={isPart && childCount === 0}
          data-uploading={uploading}
          onKeyDown={({ key }) => {
            key === 'Enter' && focused && onChapterClick(id)
          }}
          ref={chapterRef}
          role="menuitem"
          style={{
            '--spacing': `${indentationWidth * depth}px`,
          }}
          tabIndex={focused ? 0 : -1}
          {...rest}
        >
          <InnerWrapper
            data-selected={selectedChapterId === id}
            ref={ref}
            style={style}
          >
            <StyledHolderOutlined
              {...handleProps}
              tabIndex={focused ? 0 : -1}
            />
            <ChapterTitle
              data-status={status}
              data-test="producer-chapterTitle"
              onClick={() => onChapterClick(id)}
            >
              {!uploading ? title || t('new') : t('processing')}
            </ChapterTitle>
            {lock ? (
              <UserAvatar data-test="producer-userAvatar">
                {getInitials(`${lock.givenNames} ${lock.surname}`)}
              </UserAvatar>
            ) : null}
            <StyledPopup
              id={`more-actions-${id}`}
              position="inline-start"
              toggle={
                <MoreActions
                  data-test="producer-more-btn"
                  onKeyDown={e => e.key === 'Enter' && e.stopPropagation()}
                  onKeyUp={e => e.key === 'Enter' && e.stopPropagation()}
                  tabIndex={focused ? 0 : -1}
                >
                  <MoreOutlined />
                </MoreActions>
              }
            >
              <PopupContentWrapper>
                {depth === 0 && (
                  <Button
                    disabled={!canEdit}
                    onClick={() => {
                      onChapterConvert(id, isPart ? 'chapter' : 'part')

                      document
                        .querySelector(`[aria-controls="more-actions-${id}"]`)
                        .click()
                    }}
                    onKeyDown={e => e.key === 'Enter' && e.stopPropagation()}
                  >
                    {isPart
                      ? t('menu.options.convertToChapter')
                      : t('menu.options.convertToPart')}
                  </Button>
                )}
                <Button
                  data-test="producer-deleteChapter"
                  disabled={!canEdit}
                  onClick={() => onClickDelete(id)}
                  onKeyDown={e => e.key === 'Enter' && e.stopPropagation()}
                >
                  {t('menu.options.delete')}
                </Button>
              </PopupContentWrapper>
            </StyledPopup>
          </InnerWrapper>
        </Chapter>
      </div>
    )
  },
)

ChapterItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  uploading: PropTypes.bool,
  lock: PropTypes.shape({
    givenNames: PropTypes.string,
    surname: PropTypes.string,
  }),
  selectedChapterId: PropTypes.string,
  isDragging: PropTypes.bool,
  status: PropTypes.number,
  onClickDelete: PropTypes.func,
  onChapterClick: PropTypes.func,
  onChapterConvert: PropTypes.func,
  canEdit: PropTypes.bool.isRequired,
  collapseOtherParts: PropTypes.func,
  focused: PropTypes.bool,
  isPart: PropTypes.bool,
}

ChapterItem.defaultProps = {
  lock: null,
  uploading: false,
  isDragging: false,
  title: null,
  status: null,
  selectedChapterId: undefined,
  focused: false,
  isPart: false,
  onChapterConvert: null,
  collapseOtherParts: null,
  onClickDelete: null,
  onChapterClick: null,
}

export default ChapterItem
