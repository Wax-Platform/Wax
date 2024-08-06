/* eslint-disable import/no-duplicates */

/* stylelint-disable string-quotes, declaration-no-important */

import React, { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th } from '@coko/client'
import { FileOutlined } from '@ant-design/icons'

import logoMobile from '../../../static/waxdesignerwhite.svg'
import TeamPopup from './TeamPopup'
import { AiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import Toggle from '../component-ai-assistant/components/Toggle'
import { DocumentContext } from '../dashboard/hooks/DocumentContext'
import { FlexCol, FlexRow } from '../_styleds/common'

// #region styles
const StyledHeader = styled.header`
  align-items: center;
  background-color: ${th('colorBody')};
  border-bottom: 1px solid #0003;
  display: flex;
  flex-flow: row wrap;
  height: var(--header-height);
  justify-content: space-between;
  padding: 0 10px 0 0;
`

const Logo = styled.img`
  display: flex;
  height: 70%;
  margin: 0;
  object-fit: contain;
  padding: 0 0 0 8px;
`

const UserMenu = styled.div`
  align-items: center;
  display: flex;
  gap: 20px;
  height: 100%;
  justify-content: space-between;
  padding-right: 20px;

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

  > :first-child {
    align-items: center;
    border-right: 1px solid #0004;
    display: flex;
    gap: 10px;
    line-height: 1;
    padding: 0.7rem 20px;
    /* width: 100px; */
  }
`
const DocumentInfoArea = styled(FlexCol)`
  border-left: 1px solid #0004;
  font-size: 12px;
  gap: 0;
  padding: 0 8px;

  > div {
    text-decoration: underline;
    text-decoration-color: #0003;
    text-underline-offset: 2px;
  }

  > small {
    line-height: 1;
    text-decoration: none;
  }
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
  const { designerOn, setDesignerOn, updateLayout, docId } =
    useContext(AiDesignerContext)
  const { currentDoc } = useContext(DocumentContext)

  useEffect(() => {
    console.log(docId)
  }, [docId])

  return (
    <StyledHeader role="banner" {...rest}>
      <FlexRow style={{ gap: '8px', height: '100%' }}>
        <Logo src={logoMobile} alt="Wax platform"></Logo>
        {docId && currentDoc?.title && (
          <DocumentInfoArea>
            <FlexRow style={{ gap: '5px', lineHeight: 2 }}>
              <FileOutlined style={{ fontSize: '14px' }} />
              {currentDoc?.title}
            </FlexRow>
          </DocumentInfoArea>
        )}
      </FlexRow>
      <UserMenu $designerOn={designerOn}>
        <span>
          <p
            style={{
              fontWeight: 'bold',
              color: designerOn ? '#0004' : 'var(--color-trois)',
              transform: `scale(${designerOn ? '0.9' : '1'})`,
              transformOrigin: 'center',
              transition: 'all 0.3s',
            }}
          >
            Editing
          </p>
          <Toggle
            handleChange={() => {
              setDesignerOn(!designerOn)
              !designerOn
                ? updateLayout({ preview: true, editor: false })
                : updateLayout({ preview: false, editor: true })
            }}
            checked={designerOn}
          />
          <p
            style={{
              fontWeight: 'bold',
              color: designerOn ? 'var(--color-trois)' : '#0004',
              transform: `scale(${designerOn ? '1' : '0.9'})`,
              transformOrigin: 'center',
              transition: 'all 0.3s',
            }}
          >
            Design
          </p>
        </span>
        <span>
          <TeamPopup enableLogin={enableLogin} onLogout={onLogout} />
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
