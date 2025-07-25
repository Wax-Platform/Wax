/* eslint react/prop-types: 0 */
import React from 'react';
import ConnectedComment from './ConnectedComment';
import ConnectedTrackChange from './ConnectedTrackChange';

export default ({
  commentsTracks,
  view,
  position,
  recalculateTops,
  users,
  activeComment,
}) => {
  if (!position) return null;
  return (
    <>
      {commentsTracks.map((commentTrack, index) => {
        let id = '';
        if (commentTrack?.attrs?.id) {
          id = commentTrack.attrs.id;
        } else {
          id = commentTrack.id;
        }

        const top = position[index] ? position[index][id] : 0;
        if (commentTrack.data?.type === 'comment') {
          return (
            <ConnectedComment
              activeComment={activeComment}
              comment={commentTrack}
              commentId={id}
              key={id}
              recalculateTops={recalculateTops}
              top={top}
              users={users}
            />
          );
        }
        return (
          <ConnectedTrackChange
            key={id}
            recalculateTops={recalculateTops}
            top={top}
            trackChange={commentTrack}
            trackChangeId={id}
            users={users}
            view={view}
          />
        );
      })}
    </>
  );
};
