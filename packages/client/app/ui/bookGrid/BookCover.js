import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { MissingImageIcon } from '../common'

const Wrapper = styled.div`
  aspect-ratio: 101 / 136;
`

const StyledBookImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`

const BookNoCover = styled.div`
  background-color: ${th('colorBackgroundHue')};
  height: 100%;
  padding: ${grid(2.5)};
  position: relative;
  width: 100%;
`

const StyledMissingImageIcon = styled(MissingImageIcon)`
  height: calc(100% - 20px);
  position: absolute;
  width: calc(100% - 20px);
`

const BookCover = ({ className, src, title }) => {
  return (
    <Wrapper className={className}>
      {src ? (
        <StyledBookImage alt={title} src={src} />
      ) : (
        <BookNoCover>
          <StyledMissingImageIcon />
        </BookNoCover>
      )}
    </Wrapper>
  )
}

BookCover.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
}

BookCover.defaultProps = {
  src: '',
  title: '',
}

export default BookCover
