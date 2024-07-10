/* stylelint-disable no-descending-specificity */

import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { TeamOutlined } from '@ant-design/icons'
import { BlockPicker } from 'react-color'
import { th } from '@coko/client'
import YjsContext from '../../yjsProvider'
import Button from './Button'

const StyledButton = styled(Button)`
  background: none;
  border: none;
  color: ${th('colorText')};
  display: inline-block;
  font-size: inherit;
  font-weight: 700;
  line-height: 1.25;
  overflow-x: hidden;
  padding: 10px 0;
  transition: none;

  &:hover,
  &:focus {
    span {
      color: ${th('colorText')};

      &::after {
        transform: translateX(0);
      }
    }
  }

  @media screen and (min-width: ${th('mediaQueries.large')}) {
    line-height: 1.5;
    padding: 0;

    span::after {
      background-color: ${th('colorText')};
    }
  }
`

const TeamOutlinedStyled = styled(TeamOutlined)`
  font-size: 30px;
`

const TeamWrapper = styled.div`
  direction: rtl;
  position: absolute;
  z-index: 3;
`

const Popup = styled.div`
  background-color: #fff;
  border: 1px solid #000;
  height: auto;
  padding: 10px;
  position: absolute;
  top: 40px;
`

const MyUser = styled.div`
  display: flex;
`

const OtherUsers = styled.div`
  ul {
    direction: ltr;
    padding-left: 0;
  }

  ul > li {
    display: flex;
    margin-bottom: 5px;
  }

  ul > li > span {
    padding-left: 10px;
  }
`

const ColoredCircle = styled.div`
  background-color: ${props => props.color};
  border: 1px solid #000;
  border-radius: 50%;
  height: ${props => props.size};
  width: ${props => props.size};
`

const UsernameText = styled.input`
  direction: ltr;
  height: 35px;
  margin-left: 10px;
  margin-right: 10px;
  width: 200px;
`

const ColorBlock = styled.div`
  left: -50px;
  position: absolute;
  top: 75px;
`

const TeamPopup = ({ onLogout, enableLogin }) => {
  const [open, toggle] = useState(false)
  const [openColorPicker, toggleColorPicker] = useState(false)

  const { sharedUsers, updateLocalUser, yjsCurrentUser } =
    useContext(YjsContext)

  return (
    <>
      <TeamOutlinedStyled onClick={() => toggle(!open)} />
      <TeamWrapper>
        {open && (
          <Popup>
            <MyUser>
              {enableLogin && (
                <StyledButton
                  data-testid="logout-btn"
                  onClick={() => {
                    onLogout()
                  }}
                >
                  Logout
                </StyledButton>
              )}
              <UsernameText
                onChange={current => {
                  updateLocalUser({
                    displayName: current.target.value,
                    color: yjsCurrentUser.color,
                  })
                }}
                type="text"
                value={yjsCurrentUser.displayName}
              />
              <ColoredCircle
                color={yjsCurrentUser.color}
                onClick={() => toggleColorPicker(!openColorPicker)}
                size="35px"
              />
              {openColorPicker && (
                <ColorBlock>
                  <BlockPicker
                    color={yjsCurrentUser.color}
                    onChangeComplete={color => {
                      updateLocalUser({
                        displayName: yjsCurrentUser.displayName,
                        color: color.hex,
                      })
                    }}
                  />
                </ColorBlock>
              )}
            </MyUser>
            <OtherUsers>
              <ul>
                {sharedUsers
                  .filter(([id, { user }]) => user.id !== yjsCurrentUser.id)
                  .map(([id, { user }]) => (
                    <li key={user.id}>
                      <ColoredCircle color={user.color} size="35px" />{' '}
                      <span>{user.displayName}</span>{' '}
                    </li>
                  ))}
              </ul>
            </OtherUsers>
          </Popup>
        )}
      </TeamWrapper>
    </>
  )
}

TeamPopup.propTypes = {
  onLogout: PropTypes.func,
  enableLogin: PropTypes.bool,
}

TeamPopup.defaultProps = {
  onLogout: () => {},
  enableLogin: false,
}

export default TeamPopup
