/* stylelint-disable string-quotes */
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useAiDesignerContext } from '../hooks/AiDesignerContext'
import styled from 'styled-components'
import AiDesigner from '../../../AiDesigner/AiDesigner'
import { debounce, isBoolean, set } from 'lodash'
import { Result, Spin } from 'antd'
import useAssistant from '../hooks/useAiDesigner'

const SpinnerWrapper = styled.div`
  align-items: center;
  backdrop-filter: blur(5px);
  background: var(--color-trois-lightest-2);
  display: flex;
  height: 100%;
  justify-content: center;
  opacity: 0;
  position: absolute;
  transition: opacity 0.5s;
  width: 100%;
  z-index: 999;

  &[data-spinner='true'] {
    backdrop-filter: blur(3px);
    opacity: 1;
    pointer-events: all;
  }

  &[data-spinner='false'] {
    opacity: 0;
    pointer-events: none;
  }
`
const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100dvh - (var(--header-height) + var(--menu-height, 0px)));

  opacity: ${p => (p.$show ? '1' : '0')};

  overflow: hidden;
  position: relative;
  transition: all 0.3s linear;
  width: ${p => (p.$show ? '100%' : '0')};

  &::before {
    background-image: linear-gradient(
      to bottom,
      var(--color-trois-lightest-2),
      #fbf8fd00
    );
    content: '';
    display: flex;
    height: 60px;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 99;
  }
`
const PreviewIframe = styled.iframe`
  border: none;
  display: flex;
  height: calc(100%);
  width: 100%;
`

export const PagedJsPreview = props => {
  const { previewRef, previewSource, loadingPreview, setLoadingPreview } =
    useAiDesignerContext()

  useEffect(() => {
    const handleMessage = e => {
      const { id, loaded } = e.data
      console.log(id, loaded)
      if (isBoolean(loaded)) {
        console.log('setting spinner', !loaded)
        const spinner = document.querySelector('[data-spinner]')
        const setSpinner = () => set(spinner, 'dataset.spinner', !loaded)
        loaded ? debounce(setSpinner, 2000)() : setSpinner()
      }
      AiDesigner.select(id)
    }
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    const previewDocument = previewRef?.current?.contentDocument
    const previewWindow = previewRef?.current?.contentWindow

    if (!previewDocument || !previewWindow) return
    const handleClick = selectNodeOnPreview(previewDocument, previewWindow)

    previewWindow.addEventListener('click', handleClick)

    return () => {
      previewWindow.removeEventListener('click', handleClick)
    }
  }, [
    previewSource,
    previewRef?.current?.contentDocument,
    previewRef?.current?.contentDocument?.body?.querySelector('.pagedjs_pages'),
  ])

  return (
    <StyledWindow {...props}>
      <PreviewIframe
        id="pagedjs-preview-iframe"
        ref={previewRef}
        srcDoc={previewSource}
        title="Article preview"
      />
      <SpinnerWrapper data-spinner={false}>
        <Result icon={<Spin size={18} spinning />} title="Refreshing..." />
      </SpinnerWrapper>
    </StyledWindow>
  )
}

export function selectNodeOnPreview(previewDocument, previewWindow) {
  return e => {
    const { target } = e
    if (!target.hasAttribute('data-id')) e.preventDefault()
    let id =
      e.target.getAttribute('data-id') ||
      e.target.parentElement.getAttribute('data-id')
    if (
      e.target.contains(
        previewDocument.body.querySelector('.pagedjs_page_content'),
      )
    ) {
      id = 'aid-ctx-main'
    }
    if (id) {
      console.log(id)
      const onAllSelected = cb =>
        previewDocument.body.querySelectorAll(`[data-id="${id}"]`).forEach(cb)
      previewDocument.body
        .querySelectorAll('.selected-id')
        .forEach(el => el?.classList.remove('selected-id'))
      id !== 'aid-ctx-main' &&
        onAllSelected(el => el?.classList.add('selected-id'))
      previewWindow.parent.postMessage({ id }, '*')
    }
  }
}
