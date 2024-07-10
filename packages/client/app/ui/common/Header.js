/* eslint-disable import/no-duplicates */

/* stylelint-disable string-quotes, declaration-no-important */

import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, useCurrentUser } from '@coko/client'
import { PlusCircleOutlined } from '@ant-design/icons'

import logoMobile from '../../../static/wax-purple.png'
import logo from '../../../static/wax-purple.png'
import AboutModal from '../modals/AboutModal'
import TeamPopup from './TeamPopup'

// #region styles
const StyledHeader = styled.header`
  align-items: center;
  background-color: ${th('colorBody')};
  /* box-shadow: -5px 5px 18px -2px ${th('colorText')}; */
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: ${th('headerPaddingVertical')} 20px;
`

const Logo = styled.img`
  height: 50px;
  object-fit: contain;
  width: auto;
`

const UserMenu = styled.div`
  display: flex;
  justify-content: flex-end;
`

const CreateNew = styled.span`
  font-size: 30px;
  padding-right: 10px;
`

// #endregion styles

const Header = props => {
  const {
    loggedin,
    canManageUsers,
    canManageTeams,
    currentPath,
    displayName,
    onLogout,
    enableLogin,
    ...rest
  } = props

  const { currentUser } = useCurrentUser()

  const identifier = Array.from(Array(20), () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')

  return (
    <StyledHeader role="banner" {...rest}>
      <Logo src={logoMobile} alt="Wax platform"></Logo>
      <UserMenu>
        <>
          <CreateNew>
            <Link target="_blank" to={`/${identifier}`}>
              <PlusCircleOutlined />
            </Link>
          </CreateNew>
          <TeamPopup enableLogin={enableLogin} onLogout={onLogout} />
        </>
      </UserMenu>
    </StyledHeader>
  )
}

Header.propTypes = {
  loggedin: PropTypes.bool,
  currentPath: PropTypes.string.isRequired,
  // user: PropTypes.shape(),
  canManageUsers: PropTypes.bool,
  canManageTeams: PropTypes.bool,
  displayName: PropTypes.string,
  enableLogin: PropTypes.bool,
  links: PropTypes.shape({
    homepage: PropTypes.string,
    questions: PropTypes.string,
    dashboard: PropTypes.string,
    lists: PropTypes.string,
    about: PropTypes.string,
    learning: PropTypes.string,
    manageUsers: PropTypes.string,
    manageTeams: PropTypes.string,
    profile: PropTypes.string,
    login: PropTypes.string,
  }),
  onLogout: PropTypes.func,
}

Header.defaultProps = {
  loggedin: false,
  // user: {},
  canManageUsers: false,
  canManageTeams: false,
  displayName: 'User',
  enableLogin: false,
  onLogout: () => {},
  links: {
    homepage: '#',
    questions: '#',
    dashboard: '#',
    lists: '#',
    about: '#',
    learning: '#',
    manageUsers: '#',
    manageTeams: '#',
    profile: '#',
    login: '#',
  },
}

export default Header
