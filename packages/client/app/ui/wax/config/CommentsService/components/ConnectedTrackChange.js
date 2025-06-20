/* eslint react/prop-types: 0 */
import React, { useContext, useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  WaxContext,
  ApplicationContext,
  DocumentHelpers,
} from 'wax-prosemirror-core';
import { last, maxBy } from 'lodash';
import { TextSelection } from 'prosemirror-state';
import TrackChangesBox from './ui/trackChanges/TrackChangesBox';
import acceptTrackChange from './ui/trackChanges/AcceptTrackChange';
import rejectTrackChange from './ui/trackChanges/RejectTrackChange';

const ConnectedTrackChangeStyled = styled.div`
  margin-left: ${props => (props.active ? `${-20}px` : `${50}px`)};
  position: absolute;
  transition: all 1.3s;
  width: 205px;
  @media (max-width: 600px) {
    margin-left: 15px;
  }
`;

export default ({ trackChangeId, top, recalculateTops, trackChange }) => {
  const { app } = useContext(ApplicationContext);
  const context = useContext(WaxContext);
  const { activeView, pmViews } = context;
  const user = app.config.get('user');
  const [isActive, setIsActive] = useState(false);
  const { dispatch } = activeView;
  const viewId = trackChange.attrs
    ? trackChange.attrs.viewid
    : trackChange.node.attrs.viewid;

  const styles = {
    top: `${top}px`,
  };

  const trakChangePlugin = app.PmPlugins.get('trackChangePlugin');
  const activeTrackChange = trakChangePlugin.getState(activeView.state)
    .trackChange;

  const onClickBox = trackData => {
    if (
      trackData.type.groups &&
      trackData.type.groups.find(type => type.includes('block'))
    )
      return focusOnBlcock(trackData);

    if (viewId !== 'main') context.updateView({}, viewId);

    const allTracksWithSameId = DocumentHelpers.findAllMarksWithSameId(
      pmViews[viewId].state,
      trackData,
    );
    const maxPos = maxBy(allTracksWithSameId, 'pos');
    maxPos.pos += last(allTracksWithSameId).node.nodeSize;

    pmViews[viewId].dispatch(
      pmViews[viewId].state.tr.setSelection(
        new TextSelection(pmViews[viewId].state.tr.doc.resolve(maxPos.pos - 1)),
      ),
    );

    pmViews[viewId].focus();
    return true;
  };

  const focusOnBlcock = trackData => {
    const {
      data: { pmFrom },
    } = trackData;
    pmViews[viewId].dispatch(
      pmViews[viewId].state.tr.setSelection(
        new TextSelection(pmViews[viewId].state.tr.doc.resolve(pmFrom + 1)),
      ),
    );

    pmViews[viewId].focus();
    return true;
  };

  useEffect(() => {
    setIsActive(false);
    recalculateTops();
    if (activeTrackChange && trackChangeId === activeTrackChange.attrs.id) {
      setIsActive(true);
    }
  }, [activeTrackChange]);

  const onClickAccept = () => {
    const acceptConfig = app.config.get('config.AcceptTrackChangeService');
    acceptTrackChange(
      dispatch,
      user,
      activeTrackChange,
      acceptConfig,
      context,
      trackChange,
    );
    pmViews[viewId].focus();
  };

  const onClickReject = () => {
    const rejectConfig = app.config.get('config.RejectTrackChangeService');
    rejectTrackChange(
      dispatch,
      user,
      activeTrackChange,
      rejectConfig,
      context,
      trackChange,
    );
    pmViews[viewId].focus();
  };

  const MemorizedTrackChange = useMemo(
    () => (
      <ConnectedTrackChangeStyled
        active={isActive}
        data-box={trackChangeId}
        style={styles}
      >
        <TrackChangesBox
          active={isActive}
          key={trackChangeId}
          onClickAccept={onClickAccept}
          onClickBox={onClickBox}
          onClickReject={onClickReject}
          recalculateTops={recalculateTops}
          trackChangeId={trackChangeId}
          trackData={trackChange}
        />
      </ConnectedTrackChangeStyled>
    ),
    [isActive, top],
  );
  return <>{MemorizedTrackChange}</>;
};
