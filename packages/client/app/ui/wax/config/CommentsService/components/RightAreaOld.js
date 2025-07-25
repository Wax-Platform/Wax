/* eslint-disable no-param-reassign */
/* eslint react/prop-types: 0 */

import React, { useContext, useState, useMemo, useCallback } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { each, uniqBy, sortBy, groupBy } from 'lodash';
import {
  WaxContext,
  ApplicationContext,
  DocumentHelpers,
} from 'wax-prosemirror-core';
import BoxList from './BoxList';
import CommentDecorationPluginKey from '../plugins/CommentDecorationPluginKey';

export default ({ area, users }) => {
  const { app } = useContext(ApplicationContext);
  const context = useContext(WaxContext);
  const {
    pmViews,
    pmViews: { main },
    activeView,
    options: { activeComment },
  } = context;

  const trakChangePlugin = app.PmPlugins.get('trackChangePlugin');

  const [marksNodes, setMarksNodes] = useState([]);

  const [position, setPosition] = useState();
  const [isFirstRun, setFirstRun] = useState(true);

  const setTops = useCallback(() => {
    const result = [];
    let markNodeEl = null;
    let annotationTop = 0;
    let boxHeight = 0;
    let top = 0;
    let WaxSurface = {};
    let WaxSurfaceMarginTop = '';
    const allCommentsTop = [];
    let panelWrapper = {};
    let panelWrapperHeight = {};
    if (main) {
      WaxSurface = main.dom.getBoundingClientRect();
      WaxSurfaceMarginTop = window.getComputedStyle(main.dom).marginTop;
    }

    each(marksNodes[area], (markNode, pos) => {
      let id = '';

      if (markNode?.node?.attrs.id) {
        id = markNode.node.attrs.id;
      } else if (markNode?.attrs?.id) {
        id = markNode.attrs.id;
      } else {
        id = markNode.id;
      }

      let activeTrackChange = null;

      if (trakChangePlugin)
        activeTrackChange = trakChangePlugin.getState(activeView.state)
          .trackChange;

      let isActive = false;
      if (
        (activeComment && id === activeComment.id) ||
        (activeTrackChange && id === activeTrackChange.attrs.id)
      )
        isActive = true;

      // annotation top
      if (area === 'main') {
        markNodeEl = document.querySelector(`[data-id="${id}"]`);
        if (!markNodeEl && marksNodes[area][pos - 1]) {
          markNodeEl = document.querySelector(
            `[data-id="${marksNodes[area][pos - 1].id}"]`,
          );
        }

        if (markNodeEl) {
          annotationTop =
            markNodeEl.getBoundingClientRect().top -
            WaxSurface.top +
            parseInt(WaxSurfaceMarginTop.slice(0, -2), 10);
        }
      } else {
        // Notes
        panelWrapper = document.getElementsByClassName('panelWrapper');
        panelWrapperHeight = panelWrapper[0].getBoundingClientRect().height;

        markNodeEl = document
          .querySelector('#notes-container')
          .querySelector(`[data-id="${id}"]`);
        if (markNodeEl) {
          const WaxContainerTop = document
            .querySelector('#wax-container')
            .getBoundingClientRect().top;

          annotationTop =
            markNodeEl.getBoundingClientRect().top -
            panelWrapperHeight -
            WaxContainerTop -
            50;
        }
      }

      let boxEl = null;
      // get height of this markNode box
      if (markNodeEl) {
        boxEl = document.querySelector(`div[data-box="${id}"]`);
      }
      if (boxEl) {
        boxHeight = parseInt(boxEl.offsetHeight, 10);
        // where the box should move to
        top = annotationTop;
      }
      // if the above comment box has already taken up the height, move down
      if (pos > 0) {
        const previousBox = marksNodes[area][pos - 1];
        const previousEndHeight = previousBox.endHeight;
        if (annotationTop < previousEndHeight) {
          top = previousEndHeight + 2;
        }
      }
      // store where the box ends to be aware of overlaps in the next box
      markNode.endHeight = top + boxHeight + 4;
      result[pos] = top;
      allCommentsTop.push({ [id]: result[pos] });

      // if active, move as many boxes above as needed to bring it to the annotation's height
      if (isActive) {
        markNode.endHeight = annotationTop + boxHeight + 3;
        result[pos] = annotationTop;
        allCommentsTop[pos][id] = result[pos];
        let b = true;
        let i = pos;

        // first one active, none above
        if (i === 0) b = false;

        while (b) {
          const boxAbove = marksNodes[area][i - 1];
          const boxAboveEnds = boxAbove.endHeight;
          const currentTop = result[i];

          const doesOverlap = boxAboveEnds > currentTop;

          if (doesOverlap) {
            const overlap = boxAboveEnds - currentTop;
            result[i - 1] -= overlap;
            let previousMarkNode = '';

            if (marksNodes[area][i - 1]?.node?.attrs.id) {
              previousMarkNode = marksNodes[area][i - 1].node.attrs.id;
            } else if (marksNodes[area][i - 1]?.attrs?.id) {
              previousMarkNode = marksNodes[area][i - 1].attrs.id;
            } else {
              previousMarkNode = marksNodes[area][i - 1].id;
            }

            allCommentsTop[i - 1][previousMarkNode] = result[i - 1];
          }

          if (!doesOverlap) b = false;
          if (i <= 1) b = false;
          i -= 1;
        }
      }
    });
    return allCommentsTop;
  });

  const recalculateTops = () => {
    setTimeout(() => {
      setPosition(setTops());
    });
  };

  useDeepCompareEffect(() => {
    if (app.config.get('config.YjsService')) {
      setMarksNodes(
        updateMarks(
          pmViews,
          CommentDecorationPluginKey?.getState(
            main.state,
          )?.allCommentsDataList(),
        ),
      );
    } else {
      setMarksNodes(
        updateMarks(
          pmViews,
          CommentDecorationPluginKey?.getState(main.state)?.allCommentsList(),
        ),
      );
    }

    let firstRunTimeout = () => true;
    if (isFirstRun) {
      firstRunTimeout = setTimeout(() => {
        setPosition(setTops());
        setFirstRun(false);
      }, 400);
    } else {
      setPosition(setTops());
    }

    return () => clearTimeout(firstRunTimeout);
  }, [
    updateMarks(
      pmViews,
      CommentDecorationPluginKey?.getState(main.state)?.allCommentsList(),
    ),
    setTops(),
  ]);

  // useDeepCompareEffect(() => {
  //   if (app.config.get('config.YjsService')) {
  //     setMarksNodes(
  //       updateMarks(
  //         pmViews,
  //         CommentDecorationPluginKey?.getState(
  //           activeView.state,
  //         )?.allCommentsDataList(),
  //       ),
  //     );
  //   } else {
  //     setMarksNodes(
  //       updateMarks(
  //         pmViews,
  //         CommentDecorationPluginKey?.getState(
  //           activeView.state,
  //         )?.allCommentsList(),
  //       ),
  //     );
  //   }

  //   let firstRunTimeout = () => true;
  //   if (isFirstRun) {
  //     firstRunTimeout = setTimeout(() => {
  //       setPosition(setTops());
  //       setFirstRun(false);
  //     }, 400);
  //   } else {
  //     setPosition(setTops());
  //   }

  //   return () => clearTimeout(firstRunTimeout);
  // }, [
  //   updateMarks(
  //     pmViews,
  //     CommentDecorationPluginKey?.getState(activeView.state)?.allCommentsList(),
  //   ),
  //   setTops(),
  // ]);

  const CommentTrackComponent = useMemo(
    () => (
      <BoxList
        activeComment={context.options.activeComment}
        area={area}
        commentsTracks={marksNodes[area] || []}
        position={position}
        recalculateTops={recalculateTops}
        users={users}
        view={main}
      />
    ),
    [marksNodes[area] || [], position, users, context.options.activeComment],
  );
  return <>{CommentTrackComponent}</>;
};

const updateMarks = (views, comments) => {
  const newComments = groupBy(comments, comm => comm.data.group) || [];
  if (views.main) {
    const allInlineNodes = [];

    Object.keys(views).forEach(eachView => {
      allInlineNodes.push(
        ...DocumentHelpers.findInlineNodes(views[eachView].state.doc),
      );
    });

    const allBlockNodes = DocumentHelpers.findBlockNodes(views.main.state.doc);
    const finalMarks = [];
    const finalNodes = [];

    allInlineNodes.map(node => {
      if (node.node.marks.length > 0) {
        node.node.marks.filter(mark => {
          if (
            mark.type.name === 'insertion' ||
            mark.type.name === 'deletion' ||
            mark.type.name === 'format_change'
          ) {
            mark.data = {};
            mark.data.pmFrom = node.pos;
            mark.from = node.pos;
            finalMarks.push(mark);
          }
        });
      }
    });

    allBlockNodes.map(node => {
      if (node.node.attrs.track && node.node.attrs.track.length > 0) {
        node.node.data = {};
        node.node.data.pmFrom = node.pos;
        finalNodes.push(node.node);
      }
    });

    const nodesAndMarks = [...uniqBy(finalMarks, 'attrs.id'), ...finalNodes];

    const groupedMarkNodes = { main: [], notes: [] };
    nodesAndMarks.forEach(markNode => {
      if (!groupedMarkNodes[markNode.attrs.group]) {
        groupedMarkNodes[markNode.attrs.group] = [markNode];
      } else {
        groupedMarkNodes[markNode.attrs.group].push(markNode);
      }
    });
    if (newComments?.main?.length > 0) {
      groupedMarkNodes.main = groupedMarkNodes.main.concat(newComments.main);
    }
    if (newComments?.notes?.length > 0)
      groupedMarkNodes.notes = groupedMarkNodes.notes.concat(newComments.notes);

    return {
      main: sortBy(groupedMarkNodes.main, ['data.pmFrom']),
      notes: groupedMarkNodes.notes,
    };
  }
  return [];
};
