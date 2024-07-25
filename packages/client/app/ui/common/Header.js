/* eslint-disable import/no-duplicates */

/* stylelint-disable string-quotes, declaration-no-important */

import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, useCurrentUser } from '@coko/client'
import { PlusCircleOutlined } from '@ant-design/icons'

import logoMobile from '../../../static/waxdesignerwhite.svg'
import aiDesignerLogo from '../../../static/AI Design Studio-Icon.svg'
import TeamPopup from './TeamPopup'
import { AiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import AiDesigner from '../../AiDesigner/AiDesigner'
import Toggle from '../component-ai-assistant/components/Toggle'

// #region styles
const StyledHeader = styled.header`
  align-items: center;
  background-color: ${th('colorBody')};
  /* box-shadow: 0 0 15px #0003; */
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 0 10px 0 0;
  /* z-index: 99; */
`

const Logo = styled.img`
  height: 80px;
  object-fit: contain;
  width: auto;
`

const UserMenu = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  justify-content: flex-end;

  .anticon svg {
    height: 25px;
    width: 25px;
  }

  span {
    display: flex;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;

    img {
      height: 25px;
      object-fit: contain;
      width: 25px;
    }
  }

  > :last-child {
    align-items: center;
    /* background-color: ${p => (p.$designerOn ? '#027a04' : '#00696e')}; */
    border-radius: 0.3rem;
    color: ${p => (p.$designerOn ? '#027a04' : '#00696e')};
    display: flex;
    gap: 10px;
    line-height: 1;
    padding: 0.7rem 0 0.1rem;
    /* width: 100px; */
  }
`

const CreateNew = styled.span`
  font-size: 20px;
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
  const { designerOn, setDesignerOn, updateLayout } =
    useContext(AiDesignerContext)
  const { currentUser } = useCurrentUser()

  const identifier = Array.from(Array(20), () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('')

  return (
    <StyledHeader role="banner" {...rest}>
      <Logo src={logoMobile} alt="Wax platform"></Logo>
      <UserMenu $designerOn={designerOn}>
        <span>
          <CreateNew>
            <Link target="_blank" to={`/${identifier}`}>
              <PlusCircleOutlined />
            </Link>
          </CreateNew>
          <TeamPopup enableLogin={enableLogin} onLogout={onLogout} />
        </span>
        <span>
          <small
            style={{
              fontWeight: 'bold',
              color: designerOn ? '#0004' : 'var(--color-blue)',
              transform: `scale(${designerOn ? '0.9' : '1'})`,
              transformOrigin: 'center',
              transition: 'all 0.3s',
            }}
          >
            Editing mode
          </small>

          <small
            style={{
              fontWeight: 'bold',
              color: designerOn ? 'var(--color-green)' : '#0004',
              transform: `scale(${designerOn ? '1' : '0.9'})`,
              transformOrigin: 'center',
              transition: 'all 0.3s',
            }}
          >
            Design mode
          </small>
          <Toggle
            handleChange={() => {
              setDesignerOn(!designerOn)
              !designerOn
                ? updateLayout({ preview: true, editor: false })
                : updateLayout({ preview: false, editor: true })
              AiDesigner.updateContext()
            }}
            checked={designerOn}
          />
        </span>
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
