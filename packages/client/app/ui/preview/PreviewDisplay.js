import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Alert } from 'antd'
import { grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { Spin } from '../common'
import PreviewDisplayOptions from './PreviewDisplayOptions'

// #region styled
const Wrapper = styled.div`
  height: 100%;

  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100%;
  }
`

const AlertWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`

const PreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const IframeWrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  position: relative;
`

const Veil = styled.div`
  background-color: #b1b1b1;
  height: ${props => (props.hide ? 0 : '100%')};
  opacity: ${props => (props.hide ? 0 : 1)};
  position: absolute;
  transition: opacity 0.3s ease-in;
  width: ${props => (props.hide ? 0 : '100%')};
`

const StyledSpin = styled(Spin)`
  /* stylelint-disable-next-line declaration-no-important */
  max-height: 80% !important;
`

const Iframe = styled.iframe`
  border: solid 1px gainsboro;
  height: 100%;
  width: 100%;
`

const Floating = styled.div`
  align-items: center;
  display: flex;
  height: ${grid(11)};
  justify-content: center;
  position: sticky;
  width: 100%;
`
// #endregion styled

const PreviewDisplay = props => {
  const {
    className,
    isEpub,
    isPdf,
    loading,
    // noPreview,
    onOptionsChange,
    previewLink,
    spread,
    zoom,
  } = props

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.previewAndPublish.sections.format',
  })

  const [iFrameLoading, setIFrameLoading] = useState(false)

  // This and the Veil are to hide the flashing effect of the pagedjs previewer
  useEffect(() => {
    if (loading) {
      setIFrameLoading(true)
    }

    if (iFrameLoading && !loading) {
      setTimeout(() => {
        setIFrameLoading(false)
      }, 1500)
    }
  }, [loading])

  // !previewLink case?
  const showEpub = isEpub
  // const showNoPreview = !isEpub && noPreview
  // const showLoading = !isEpub && !noPreview && loading
  const showLoading = !isEpub && (loading || iFrameLoading)
  // const showPreview = !isEpub && !noPreview
  const showPreview = !isEpub

  return (
    <Wrapper className={className}>
      {showEpub && (
        <AlertWrapper>
          <Alert
            description={t('epub.alert.detail')}
            message={t('epub.alert.title')}
            type="warning"
          />
        </AlertWrapper>
      )}

      {/* {showNoPreview && (
        <AlertWrapper>
          <Alert
            message="Something went wrong while generating the preview."
            type="error"
          />
        </AlertWrapper>
      )} */}

      {showPreview && (
        <PreviewWrapper>
          <StyledSpin spinning={showLoading}>
            <IframeWrapper>
              <Veil hide={!iFrameLoading && !!previewLink} />
              <Iframe id="previewer" src={previewLink} />
            </IframeWrapper>
          </StyledSpin>

          {isPdf && (
            <Floating>
              <PreviewDisplayOptions
                disabled={loading}
                onOptionsChange={onOptionsChange}
                spread={spread}
                zoom={zoom}
              />
            </Floating>
          )}
        </PreviewWrapper>
      )}
    </Wrapper>
  )
}

PreviewDisplay.propTypes = {
  isEpub: PropTypes.bool,
  isPdf: PropTypes.bool,
  loading: PropTypes.bool.isRequired,
  // noPreview: PropTypes.bool.isRequired,
  onOptionsChange: PropTypes.func.isRequired,
  previewLink: PropTypes.string,
  spread: PropTypes.oneOf(['single', 'double']),
  zoom: PropTypes.number,
}

PreviewDisplay.defaultProps = {
  previewLink: null,
  spread: 'single',
  zoom: 1,
  isEpub: false,
  isPdf: true,
}

export default PreviewDisplay
