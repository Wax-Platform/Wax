import React from 'react'
import styled from 'styled-components'

const StyledNavigationBar = styled.div`
  background: cornflowerblue;
  color: white;
  height: 50px;
  line-height: 50px;
  padding: 0 8px;
`

const NavigationBar = () => (
  <StyledNavigationBar>
    <span>This is the navigation bar</span>
  </StyledNavigationBar>
)

export default NavigationBar
