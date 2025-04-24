/* eslint-disable no-alert */
import React from 'react'
import styled from 'styled-components'
import { BookTitle } from '../app/ui/createBook'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100vh;
  justify-content: center;
  width: 100%;
`

const submitBookTitle = title => alert(title)

export const Base = () => (
  <Wrapper>
    <BookTitle onClickContinue={submitBookTitle} />
  </Wrapper>
)

export default {
  component: BookTitle,
  title: 'BookTitle/BookTitle',
}
