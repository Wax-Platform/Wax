/* eslint-disable no-param-reassign */
/* eslint react/prop-types: 0 */
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { TextSelection } from 'prosemirror-state';
import styled from 'styled-components';
import { WaxContext, ApplicationContext } from 'wax-prosemirror-core';
import { override } from '@pubsweet/ui-toolkit';
import CommentBox from './ui/comments/CommentBox';
import CommentDecorationPluginKey from '../plugins/CommentDecorationPluginKey';

const ConnectedCommentStyled = styled.div`
  margin-left: ${props => (props.active ? `${-20}px` : `${50}px`)};
  position: absolute;
  transition: ${props =>
    props.active && props.length ? `none!important` : `all 1.3s`};
  width: 205px;
  @media (max-width: 600px) {
    margin-left: 15px;
  }

  ${override('Wax.CommentOuterBox')}
`;

export default ({
  comment,
  top,
  commentId,
  users,
  activeComment,
  recalculateTops,
}) => {
  const { app } = useContext(ApplicationContext);
  const context = useContext(WaxContext);
  const {
    pmViews,
    pmViews: {
      main: {
        props: { user },
      },
    },
    activeView,
  } = context;

  const [isActive, setIsActive] = useState(false);
  const [clickPost, setClickPost] = useState(false);

  const { state } = activeView;
  const { viewId, conversation } = comment.data;
  const styles = {
    top: `${top}px`,
  };

  const commentConfig = app.config.get('config.CommentsService');
  const isReadOnlyResolve =
    commentConfig && commentConfig.readOnlyResolve
      ? commentConfig.readOnlyResolve
      : false;
  const isReadOnlyPost =
    commentConfig && commentConfig.readOnlyPost
      ? commentConfig.readOnlyPost
      : false;
  const showTitle =
    commentConfig && commentConfig.showTitle ? commentConfig.showTitle : false;
  const usersMentionList =
    commentConfig && commentConfig.userList ? commentConfig.userList : [];
  const getMentionedUsers =
    commentConfig && commentConfig.getMentionedUsers
      ? commentConfig.getMentionedUsers
      : () => true;

  useEffect(() => {
    recalculateTops();
    if (activeComment && commentId === activeComment.id) {
      setIsActive(true);
    } else if (
      (activeComment && commentId !== activeComment.id) ||
      !activeComment
    ) {
      setIsActive(false);
    }
  }, [activeComment]);

  const onClickPost = ({ commentValue, title }) => {
    getUsersFromComment(commentValue);
    setClickPost(true);
    const currentUser = user || (users || []).find(u => u.currentUser === true);

    const obj = {
      content: commentValue,
      displayName: currentUser
        ? currentUser.displayName || currentUser.username
        : 'Anonymous',
      userId: currentUser ? currentUser.userId : '1',
      timestamp: Math.floor(Date.now()),
    };

    comment.data.title = title || comment.data.title;
    comment.data.conversation.push(obj);

    context.activeView.dispatch(
      context.activeView.state.tr.setMeta(CommentDecorationPluginKey, {
        type: 'updateComment',
        id: activeComment.id,
        data: comment.data,
      }),
    );

    activeView.focus();
    recalculateTops();
  };

  const getUsersFromComment = commentText => {
    if (usersMentionList.length === 0) return false;
    const mentionedUsers = [];
    usersMentionList.forEach(mentionUser => {
      if (commentText.includes(mentionUser.displayName)) {
        mentionedUsers.push(mentionUser);
      }
    });
    if (mentionedUsers.length > 0)
      getMentionedUsers(mentionedUsers, commentText);
  };

  const onClickBox = () => {
    if (isActive) {
      pmViews[viewId].focus();
      return false;
    }

    if (viewId !== 'main') context.updateView({}, viewId);
    const commentFromMap = CommentDecorationPluginKey.getState(state)
      .getMap()
      .get(comment.id);
    pmViews[viewId].dispatch(
      pmViews[viewId].state.tr.setSelection(
        new TextSelection(
          pmViews[viewId].state.tr.doc.resolve(commentFromMap.data.pmFrom),
        ),
      ),
    );

    pmViews[viewId].focus();
    return true;
  };

  const onClickResolve = e => {
    e.preventDefault();
    e.stopPropagation();
    context.setOption({ resolvedComment: activeComment.id });
    context.activeView.dispatch(
      state.tr.setMeta(CommentDecorationPluginKey, {
        type: 'deleteComment',
        id: activeComment.id,
      }),
    );

    context.activeView.dispatch(state.tr);
    activeView.focus();
  };
  const onTextAreaBlur = e => {
    if (conversation.length === 0 && !clickPost) {
      onClickResolve(e);
      activeView.focus();
    }
  };

  const MemorizedComponent = useMemo(
    () => (
      <ConnectedCommentStyled
        active={isActive}
        data-box={commentId}
        length={conversation.length === 0}
        style={styles}
      >
        <CommentBox
          active={isActive}
          commentData={conversation}
          commentId={commentId}
          isReadOnlyPost={isReadOnlyPost}
          isReadOnlyResolve={isReadOnlyResolve}
          key={commentId}
          onClickBox={onClickBox}
          onClickPost={onClickPost}
          onClickResolve={onClickResolve}
          onTextAreaBlur={e => onTextAreaBlur(e)}
          showTitle={showTitle}
          title={comment.data.title}
          users={users}
          usersMentionList={usersMentionList}
        />
      </ConnectedCommentStyled>
    ),
    [isActive, top, conversation.length, users],
  );

  // const MemorizedComponent = useMemo(() => {
  //   return top > 40 ? (
  //     <ConnectedCommentStyled
  //       active={isActive}
  //       data-box={commentId}
  //       length={conversation.length === 0}
  //       style={styles}
  //     >
  //       <CommentBox
  //         active={isActive}
  //         commentData={conversation}
  //         commentId={commentId}
  //         isReadOnlyPost={isReadOnlyPost}
  //         isReadOnlyResolve={isReadOnlyResolve}
  //         key={commentId}
  //         onClickBox={onClickBox}
  //         onClickPost={onClickPost}
  //         onClickResolve={onClickResolve}
  //         onTextAreaBlur={e => onTextAreaBlur(e)}
  //         showTitle={showTitle}
  //         title={comment.data.title}
  //         users={users}
  //         usersMentionList={usersMentionList}
  //       />
  //     </ConnectedCommentStyled>
  //   ) : null;
  // }, [isActive, top, conversation.length, users]);

  return <>{MemorizedComponent}</>;
};
