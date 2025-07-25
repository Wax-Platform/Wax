/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import { grid, th, override } from '@pubsweet/ui-toolkit';
import { useOnClickOutside } from 'wax-prosemirror-core';
import Mentions from 'rc-mentions';
import './mentions.css';

const Wrapper = styled.div`
  background: ${th('colorBackgroundHue')};
  display: flex;
  flex-direction: column;
  padding: ${grid(2)} ${grid(4)};
`;

const TextWrapper = styled.div``;

const CommentTitle = styled.input`
  background: ${th('colorBackgroundHue')};
  border: 3px solid ${th('colorBackgroundTabs')};
  font-family: ${th('fontWriting')};
  margin-bottom: 10px;
  position: relative;
  width: 100%;

  &:focus {
    outline: 1px solid ${th('colorPrimary')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('Wax.CommentTitle')}
`;

const ActionWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 4px;
`;

const primary = css`
  background: ${th('colorPrimary')};
  color: white;
`;

const Button = styled.button`
  border: 0;
  border-radius: 5px;
  color: gray;
  cursor: pointer;
  padding: ${grid(2)} ${grid(4)};
  
  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props => props.primary && primary}
  ${props => props.disabled && `cursor: not-allowed; opacity: 0.3;`}

  ${override('Wax.CommentButtons')}
`;

const ButtonGroup = styled.div`
  > button:not(:last-of-type) {
    margin-right: 8px;
  }

  ${override('Wax.CommentButtonGroup')}
`;

const StyledMentions = styled(Mentions)`
  border: none;

  > textarea {
    background: ${th('colorBackgroundHue')};
    border: 3px solid ${th('colorBackgroundTabs')};
    font-family: ${th('fontWriting')};
    font-size: 14px;
    padding: 2px;

    &:focus {
      outline: 1px solid ${th('colorPrimary')};
    }
  }

  ${override('Wax.CommentTextArea')}
`;

const CommentReply = props => {
  const {
    className,
    isNewComment,
    onClickPost,
    isReadOnlyPost,
    onTextAreaBlur,
    showTitle,
    usersMentionList,
  } = props;
  const { t, i18n } = useTranslation();
  const commentInput = useRef(null);
  const commentTitle = useRef(null);
  const [commentValue, setCommentValue] = useState('');
  const [title, setTitle] = useState('');
  const ref = useRef(null);

  useOnClickOutside(ref, onTextAreaBlur);

  useEffect(() => {
    setTimeout(() => {
      if (commentTitle.current && isNewComment) commentTitle.current.focus();
      if (!commentTitle.current && isNewComment) commentInput.current.focus();
    });
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    onClickPost({ title, commentValue });
    setCommentValue('');
    setTitle('');
  };

  const resetValue = e => {
    e.preventDefault();
    setCommentValue('');
    setTitle('');
  };

  const { Option } = Mentions;

  return (
    <Wrapper className={className} ref={ref}>
      <TextWrapper>
        {isNewComment && showTitle && (
          <CommentTitle
            name="title"
            onChange={e => {
              setTitle(e.target.value);
            }}
            placeholder={`${
              !isEmpty(i18n) && i18n.exists(`Wax.Comments.Write title`)
                ? t(`Wax.Comments.Write title`)
                : 'Write title'
            }...`}
            ref={commentTitle}
            type="text"
            value={title}
          />
        )}

        <StyledMentions
          onChange={text => {
            setCommentValue(text);
          }}
          onPressEnter={e => {
            const mentionsOptionsEl = document.getElementsByClassName(
              'rc-mentions-measure',
            );

            if (
              e.keyCode === 13 &&
              !e.shiftKey &&
              mentionsOptionsEl.length === 0
            ) {
              e.preventDefault();
              if (commentValue) handleSubmit(e);
            }
          }}
          placeholder={
            isNewComment
              ? `${
                  !isEmpty(i18n) && i18n.exists(`Wax.Comments.Write comment`)
                    ? t(`Wax.Comments.Write comment`)
                    : 'Write comment'
                }...`
              : `${
                  !isEmpty(i18n) && i18n.exists(`Wax.Comments.Reply`)
                    ? t(`Wax.Comments.Reply`)
                    : 'Reply'
                }...`
          }
          ref={commentInput}
          rows="4"
          value={commentValue}
        >
          {usersMentionList &&
            usersMentionList.map(item => (
              <Option key={item.id} value={item.displayName}>
                {item.displayName}
              </Option>
            ))}
        </StyledMentions>
      </TextWrapper>

      <ActionWrapper>
        <ButtonGroup>
          <Button
            disabled={commentValue.length === 0 || isReadOnlyPost}
            onClick={handleSubmit}
            primary
            type="submit"
          >
            {!isEmpty(i18n) && i18n.exists(`Wax.Comments.Post`)
              ? t(`Wax.Comments.Post`)
              : 'Post'}
          </Button>

          <Button disabled={commentValue.length === 0} onClick={resetValue}>
            {!isEmpty(i18n) && i18n.exists(`Wax.Comments.Cancel`)
              ? t(`Wax.Comments.Cancel`)
              : 'Cancel'}
          </Button>
        </ButtonGroup>
      </ActionWrapper>
    </Wrapper>
  );
};

CommentReply.propTypes = {
  isNewComment: PropTypes.bool.isRequired,
  onClickPost: PropTypes.func.isRequired,
  isReadOnlyPost: PropTypes.bool.isRequired,
  onTextAreaBlur: PropTypes.func.isRequired,
  showTitle: PropTypes.bool.isRequired,
};

CommentReply.defaultProps = {};

export default CommentReply;
