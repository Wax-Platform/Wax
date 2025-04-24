import React, { useRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Button from './Button'

const HiddenInput = styled.input`
  display: none;
`

const StyledButton = styled(Button)`
  padding: 0;

  &:hover:not([disabled]) {
    background-color: unset;
  }
`

const SimpleUpload = props => {
  const { handleFileChange, label, disabled, acceptedTypes } = props
  const fileInputRef = useRef(null)

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div>
      <HiddenInput
        accept={acceptedTypes}
        aria-label="Select book thumbnail"
        disabled={disabled}
        onChange={e => handleFileChange(e.target.files[0])}
        ref={fileInputRef}
        type="file"
      />
      <StyledButton disabled={disabled} onClick={handleButtonClick} type="text">
        {label}
      </StyledButton>
    </div>
  )
}

SimpleUpload.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  acceptedTypes: PropTypes.string,
}

SimpleUpload.defaultProps = {
  disabled: false,
  acceptedTypes: '',
}

export default SimpleUpload
