/* stylelint-disable declaration-no-important */
/* stylelint-disable string-quotes */
/* stylelint-disable value-list-comma-newline-after */
import React, { useContext } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid, th } from '@coko/client'
import { Avatar } from 'antd'
import Popup from '@coko/client/dist/ui/common/Popup'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import { LanguageSwitcher } from '../languageSwitcher'
import YjsContext from '../provider-yjs/YjsProvider'

// #region styles
const StyledHeader = styled.header`
  align-items: center;
  background-color: ${th('colorBody')};
  border-bottom: ${th('borderWidth')} ${th('borderStyle')} ${th('colorBorder')};
  display: flex;
  height: 48px;
  justify-content: flex-start;
  padding: ${grid(1)};
  width: 100%;
  z-index: 9;
`

const Navigation = styled.nav`
  align-items: center;
  background-color: ${th('colorBody')};
  display: flex;
  height: 100%;
  justify-content: space-between;
  width: calc(100vw - 56px);
`

const BookTitle = styled.h1`
  flex-grow: 1;
  font-size: ${th('fontSizeLarge')};
  font-weight: bold;
  overflow: hidden;
  padding: ${grid(2)};
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-pad-left='true'] {
    padding-inline-start: 90px;
  }
`

const BrandingContainer = styled.div`
  margin-right: ${grid(2)};
`

const UnstyledLink = styled(Link)`
  align-items: center;
  border-radius: ${th('borderRadius')};
  color: inherit;
  display: inline-flex;
  justify-content: center;
  min-block-size: 32px;
  padding: 4px;
  text-decoration: none;

  &:hover,
  &:focus,
  &:active {
    background-color: rgba(105 105 105 / 6%);
    color: inherit;
    text-decoration: none;
  }
`

const BrandLogo = styled.img`
  height: 36px;
`

const BrandLabel = styled.div`
  font-size: ${th('fontSizeLarge')};
  font-weight: bold;
`

const StyledPopup = styled(Popup)`
  border: 1px solid ${th('colorBorder')};
  border-block-start: none;
  border-radius: 0;
  box-shadow: 0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%),
    0 9px 28px 8px rgb(0 0 0 / 5%);
  margin-top: ${grid(1)};
  padding: 5px;

  &::before,
  &::after {
    background-color: inherit;
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
    content: '';
    height: 7px;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
    right: 12px;
    top: -7px;
    width: 16px;
    z-index: 1;
  }

  &::before {
    background-color: ${th('colorBorder')};
    top: -8px;
  }
`

const StyledAvatar = styled(Avatar)`
  display: grid;
  font-weight: bold;
  place-content: center;
`

const PopupContentWrapper = styled.div`
  display: flex;
  flex-direction: column;

  > * {
    background-color: transparent;
    border: none;
    padding: 5px 12px;

    &:focus,
    &:hover {
      background-color: rgb(105 105 105 / 4%);
      color: inherit !important;
      outline: none;
    }
  }
`

const UlUsers = styled.ul`
  display: flex;
  list-style: none;
  margin-right: 50px;

  li {
    margin-left: 5px;
  }
`
// #endregion styles

const getInitials = fullname => {
  const deconstructName = fullname.split(' ')
  return `${deconstructName[0][0].toUpperCase()}${
    deconstructName[1][0] && deconstructName[1][0].toUpperCase()
  }`
}

const OtherUsers = ({ currentUser }) => {
  const { sharedUsers } = useContext(YjsContext)

  return (
    <UlUsers>
      {sharedUsers
        .filter(({ user }) => user.id !== currentUser?.id)
        .map(({ user }) => (
          <li key={user.id}>
            <StyledAvatar style={{ backgroundColor: user.color, color: '#000' }} data-test="avatar-initials">
                  {getInitials(user.displayName)}
                </StyledAvatar>
            {/* <ColoredCircle color={user.color} size="35px" />{' '}
              <span>{user.displayName}</span>{' '} */}
          </li>
        ))}
    </UlUsers>
  )
}

const Header = props => {
  const {
    homeURL,
    brandLabel,
    brandLogoURL,
    canAccessAdminPage,
    onLogout,
    showDashboard,
    dashboardURL,
    showBackToBook,
    backToBookURL,
    previewURL,
    dropdownItems,
    languages,
    bookTitle,
    currentUser,
    ...rest
  } = props

  const history = useHistory()
  const location = useLocation()

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.common.header.menu.options',
  })

  const userDisplayName=currentUser ? currentUser.displayName : ''

  const navItemsLeft = []

  const match = location.pathname.match(/^\/document\/([^/]+)\/[^/]+/)
  const bookComponentId = match?.[1] || null

  const to = bookComponentId ? `/document/${bookComponentId}` : '/'
  
  if (showBackToBook) {

    navItemsLeft.push(
      <UnstyledLink
        data-test="header-back-link"
        key="back"
        style={{ position: 'absolute' }}
        to={to}
      >
        {t('backToBook')}
      </UnstyledLink>,
    )
  }

  return (
    <StyledHeader role="banner" {...rest}>
      <BrandingContainer>
        <UnstyledLink data-test="header-logo-link" to={to}>
          {brandLogoURL ? (
            <BrandLogo alt={brandLabel} src={brandLogoURL} />
          ) : (
            <BrandLabel>{brandLabel}</BrandLabel>
          )}
        </UnstyledLink>
      </BrandingContainer>
      <Navigation role="navigation">
        {navItemsLeft.map(el => el)}
        <BookTitle data-pad-left={showBackToBook}>{bookTitle}</BookTitle>
        <OtherUsers currentUser={currentUser} />
        {userDisplayName ? (
          <StyledPopup
            alignment="end"
            position="block-end"
            toggle={
              <Button type="text">
                <StyledAvatar data-test="avatar-initials">
                  {getInitials(userDisplayName)}
                </StyledAvatar>
              </Button>
            }
          >
            <PopupContentWrapper>
              <LanguageSwitcher languages={languages} />
              <UnstyledLink
                onClick={() => {
                  history.push('/')
                }}
                to={homeURL}
              >
                Editor
              </UnstyledLink>
              {canAccessAdminPage && (
                <>
                  <UnstyledLink
                    data-test="header-admin-link"
                    onClick={() => {
                      document.querySelector('#main-content').focus()
                    }}
                    to="/admin"
                  >
                    {t('admin')}
                  </UnstyledLink>
                  <UnstyledLink
                    data-test="header-admin-link"
                    onClick={() => {
                      document.querySelector('#main-content').focus()
                    }}
                    to="/template-manager"
                  >
                    Templates
                  </UnstyledLink>
                </>
              )}
              <Button data-test="logout-button" onClick={onLogout}>
                {t('logout')}
              </Button>
            </PopupContentWrapper>
          </StyledPopup>
        ) : (
          <LanguageSwitcher languages={languages} />
        )}
      </Navigation>
    </StyledHeader>
  )
}

Header.propTypes = {
  brandLabel: PropTypes.string.isRequired,
  brandLogoURL: PropTypes.string,
  canAccessAdminPage: PropTypes.bool,
  homeURL: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
  showBackToBook: PropTypes.bool.isRequired,
  showDashboard: PropTypes.bool,
  dashboardURL: PropTypes.string,
  backToBookURL: PropTypes.string,
  bookTitle: PropTypes.string,
  previewURL: PropTypes.string,
  dropdownItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      onClickHandler: PropTypes.func.isRequired,
    }),
  ),
  languages: PropTypes.arrayOf(PropTypes.shape({})),
}

Header.defaultProps = {
  brandLogoURL: null,
  canAccessAdminPage: false,
  dropdownItems: [],
  dashboardURL: null,
  backToBookURL: null,
  previewURL: null,
  languages: [],
  showDashboard: true,
  bookTitle: '',
}

export default Header
