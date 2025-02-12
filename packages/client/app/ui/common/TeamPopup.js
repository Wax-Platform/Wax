/* stylelint-disable declaration-no-important */
/* stylelint-disable no-descending-specificity */

import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { BlockPicker } from 'react-color'
import { th, useCurrentUser } from '@coko/client'
import YjsContext from '../../yjsProvider'
import Button from './Button'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { useApolloClient } from '@apollo/client'

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

const TeamWrapper = styled.div`
  padding: 0 20px;
  z-index: 3;
`

const Popup = styled.div`
  height: fit-content;
  padding: 0 20px;
  padding: 10px;
  top: 40px;
`

const MyUser = styled.div`
  align-items: center;
  color: var(--color-trois-dark);
  display: flex;
  font-weight: 700;
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
  background-color: ${p => p.color};
  border: 1px solid #0001;
  border-radius: 50%;
  height: ${p => p.size};
  min-width: ${p => p.size};
  width: ${p => p.size};
`

const UsernameText = styled.input`
  background: none;
  border: none;
  border-bottom: 1px solid #0003;
  height: 20px;
  margin-left: 10px;
  margin-right: 10px;
  width: 200px;
`

const ColorBlock = styled.div`
  position: relative;
`
const StyledBlockPicker = styled(BlockPicker)`
  position: absolute !important;
  right: 0;
  top: calc(100% + 20px);
`

const TeamPopup = () => {
  const client = useApolloClient()

  const [openColorPicker, toggleColorPicker] = useState(false)
  const history = useHistory()
  const { setCurrentUser } = useCurrentUser()
  const logout = () => {
    setCurrentUser(null)
    client.cache.reset()

    localStorage.removeItem('token')
    history.push('/login')
  }

  const { sharedUsers, updateLocalUser, yjsCurrentUser } =
    useContext(YjsContext)

  return (
    <TeamWrapper>
      <Popup>
        <MyUser>
          <p>Name:</p>
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
            size="20px"
          />
          {openColorPicker && (
            <ColorBlock>
              <StyledBlockPicker
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
        <StyledButton data-testid="logout-btn" onClick={logout}>
          Logout
        </StyledButton>
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
    </TeamWrapper>
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
