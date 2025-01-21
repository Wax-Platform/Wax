/* stylelint-disable string-quotes, declaration-no-important */
import React, { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import logoMobile from '../../../static/waxdesignerwhite.svg'
import {
  AiDesignerContext,
  useAiDesignerContext,
} from '../component-ai-assistant/hooks/AiDesignerContext'
import Toggle from '../component-ai-assistant/components/Toggle'
import { DocumentContext } from '../dashboard/hooks/DocumentContext'
import { CleanButton, FlexCol, FlexRow } from '../_styleds/common'
import PathRender from '../dashboard/MainMenu/PathRender'
import { objIf } from '../../shared/generalUtils'

// #region styles
const StyledHeader = styled.header`
  align-items: center;
  background: var(--color-trois-lightest-2);
  display: flex;
  height: var(--header-height);
  justify-content: space-between;
  padding: 0 10px 0 0;
  z-index: 999;
`

const Logo = styled.img`
  display: flex;
  height: 100%;
  margin: 0;
  object-fit: contain;
  padding-inline: 5px 12px;
`

const UserMenu = styled.div`
  align-items: center;
  display: flex;
  gap: 11px;
  height: 100%;
  justify-content: space-between;

  .anticon svg {
    height: 25px;
    width: 25px;
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
    border-left: 1px solid #0001;
    display: flex;
    gap: 10px;
    line-height: 1;
    padding: 0.7rem 20px;
  }
`
const DocumentInfoArea = styled(FlexCol)`
  border-left: 1px solid #0001;
  gap: 2px;
  height: 100%;
  line-height: 1;
  padding: 0 20px;

  > p {
    color: #222;
    font-size: 15px;
    margin: 0;
  }

  > small {
    font-size: 10px;
    text-decoration: none;
  }
`

const EditDesignLabels = styled(CleanButton)`
  color: ${p =>
    p.$active ? p.$activecolor ?? 'var(--active-color)' : '#0004'};
  font-weight: bold;
  transform: scale(${p => (p.$active ? '1' : '0.9')});
  transform-origin: center;
  transition: all 0.3s;
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
  const { designerOn, setDesignerOn, updateLayout } = useAiDesignerContext()
  const { currentDoc, graphQL, docId } = useContext(DocumentContext)
  const { openFolder, getCurrentDocPath } = graphQL

  useEffect(() => {
    if (docId) {
      openFolder({ variables: { id: docId, resourceType: 'doc' } })
    }
  }, [docId])

  useEffect(() => {
    if (currentDoc?.doc?.id) {
      console.log({ currentDoc })
      getCurrentDocPath({ variables: { id: currentDoc.doc.id } })
      document.title = `${currentDoc.title} - Wax`
    }
  }, [currentDoc])

  const toggleDesigner = () => {
    setDesignerOn(!designerOn)
    !designerOn
      ? updateLayout({
          preview: true,
          editor: false,
          chat: true,
          team: false,
          files: false,
          templateManager: false,
          userMenu: true,
        })
      : updateLayout({
          preview: false,
          editor: true,
          chat: false,
          userMenu: true,
          files: true,
          templateManager: false,
        })
  }
  return (
    <StyledHeader
      role="banner"
      style={objIf(!currentDoc?.title, { justifyContent: 'flex-start' })}
      {...rest}
    >
      <FlexRow style={{ gap: '0', height: '100%' }}>
        <Logo src={logoMobile} alt="Wax platform"></Logo>
        {currentDoc?.title && (
          <DocumentInfoArea>
            <small>Document:</small>
            <p>{currentDoc?.title}</p>
          </DocumentInfoArea>
        )}
      </FlexRow>
      {currentDoc?.title ? (
        <UserMenu $designerOn={designerOn}>
          <FlexRow>
            <EditDesignLabels $active={!designerOn} $activecolor="#222">
              Edit
            </EditDesignLabels>
            <Toggle handleChange={toggleDesigner} checked={designerOn} />
            <EditDesignLabels
              $active={designerOn}
              $activecolor="var(--color-trois)"
            >
              Design
            </EditDesignLabels>
          </FlexRow>
        </UserMenu>
      ) : (
        <PathRender style={{ width: '90%' }} />
      )}
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
