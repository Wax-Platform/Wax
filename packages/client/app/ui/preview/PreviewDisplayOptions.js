import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Radio, Button } from 'antd'
import {
  BorderOutlined,
  ReadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons'

import { grid, th } from '@coko/client'

const Wrapper = styled.div`
  display: flex;

  > div:first-child {
    margin-right: ${grid(5)};
  }
`

const ZoomWrapper = styled.div`
  align-items: center;
  display: flex;
`

const Zoom = styled.div`
  background-color: ${th('colorPrimary')};
  border-radius: ${th('borderRadius')};
  color: ${th('colorTextReverse')};
  margin: 0 ${grid(1)};
  padding: ${grid(1)} ${grid(2)};
`

const ZoomButton = styled(Button)`
  border: 0;
  box-shadow: none;
`

const zoomStep = 0.1
const zoomMin = 0.3

const PreviewDisplayOptions = props => {
  const { className, disabled, onOptionsChange, spread, zoom } = props

  const [options, setOptions] = useState({
    zoom,
    spread,
  })

  const firstUpdate = useRef(true)

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    onOptionsChange(options)
  }, [options])

  const handleChangeSpread = e => {
    if (disabled) return // handle here insted of ui to prevent flashing
    setOptions({ ...options, spread: e.target.value })
  }

  const handleZoomIn = () => {
    if (disabled) return
    const newZoom = Math.round((options.zoom + zoomStep) * 100) / 100
    setOptions({ ...options, zoom: newZoom })
  }

  const handleZoomOut = () => {
    if (disabled) return
    const newZoom = Math.round((options.zoom - zoomStep) * 100) / 100
    setOptions({ ...options, zoom: newZoom })
  }

  const zoomAtMax = options.zoom === 1
  const zoomAtMin = options.zoom <= zoomMin

  return (
    <Wrapper className={className}>
      <Radio.Group
        buttonStyle="solid"
        // disabled={disabled}
        onChange={handleChangeSpread}
        value={options.spread}
      >
        <Radio.Button data-test="preview-doublePage-btn" value="double">
          <ReadOutlined />
        </Radio.Button>

        <Radio.Button data-test="preview-singlePage-btn" value="single">
          <BorderOutlined />
        </Radio.Button>
      </Radio.Group>

      <ZoomWrapper>
        <ZoomButton
          // disabled={disabled || zoomAtMin}
          data-test="preview-zoomOut-btn"
          disabled={zoomAtMin}
          icon={<ZoomOutOutlined />}
          onClick={handleZoomOut}
          shape="circle"
        />

        <Zoom>{`${options.zoom * 100} %`}</Zoom>

        <ZoomButton
          // disabled={disabled || zoomAtMax}
          data-test="preview-zoomIn-btn"
          disabled={zoomAtMax}
          icon={<ZoomInOutlined />}
          onClick={handleZoomIn}
          shape="circle"
        />
      </ZoomWrapper>
    </Wrapper>
  )
}

PreviewDisplayOptions.propTypes = {
  disabled: PropTypes.bool,
  onOptionsChange: PropTypes.func.isRequired,
  spread: PropTypes.oneOf(['single', 'double']).isRequired,
  zoom: PropTypes.number.isRequired,
}

PreviewDisplayOptions.defaultProps = {
  disabled: false,
}

export default PreviewDisplayOptions
