/* stylelint-disable string-quotes, declaration-no-important */
import React, { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import logoMobile from '../../../static/waxdesignerwhite.svg'
import { useAiDesignerContext } from '../component-ai-assistant/hooks/AiDesignerContext'
import Toggle from '../component-ai-assistant/components/Toggle'
import { DocumentContext } from '../dashboard/hooks/DocumentContext'
import { CleanButton, FlexCol, FlexRow } from '../_styleds/common'
import PathRender from '../dashboard/MainMenu/PathRender'
import { objIf } from '../../shared/generalUtils'
import {
  RedoIcon,
  RefreshIcon,
  UndoIcon,
} from '../component-ai-assistant/utils'
import { PrinterOutlined, SaveOutlined } from '@ant-design/icons'
import { TemplatesDropdown } from '../dashboard/MainMenu/TemplatesDropdown'
import { debounce } from 'lodash'
import { useLayout } from '../../hooks/LayoutContext'

// #region styles
const StyledHeader = styled.header`
  align-items: center;
  background: var(--color-trois-lightest-2);
  display: flex;
  height: var(--header-height);
  justify-content: space-between;
  padding: 0 10px 0 0;
  position: relative;
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

  button {
    background: none;
    border: none;
    cursor: pointer;

    img {
      height: 22px;
      object-fit: contain;
      width: 22px;
    }
  }

  > :last-child {
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

const DesignerActions = styled(FlexRow)`
  /* background: var(--color-trois-lightest); */
  border-radius: 1rem;
  bottom: -40px;
  gap: 12px;
  height: 30px;
  justify-content: center;
  max-width: ${p => (p.$designerOn ? '300px' : '0')};
  opacity: ${p => (p.$designerOn ? '1' : '0')};
  padding: 0 0.5rem;
  pointer-events: ${p => (p.$designerOn ? 'all' : 'none')};
  /* position: absolute; */
  /* right: 40px; */
  transition: all 0.3s;
  z-index: 88;

  button {
    padding: 0;
  }

  svg {
    fill: var(--color-trois-opaque);
    height: 16px;
    transform: ${p => (p.$designerOn ? 'scale(1)' : 'scale(0)')};
    transition: all 0.3s;
    width: 16px;
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

  const {
    designerOn,
    setDesignerOn,
    previewRef,
    updatePreview,
    onHistory,
    css,
  } = useAiDesignerContext()

  const { userMenu, editors } = useLayout()

  const { currentDoc } = useContext(DocumentContext)

  const toggleDesigner = () => {
    setDesignerOn(!designerOn)
    editors.update({ preview: !designerOn, wax: designerOn })
    designerOn &&
      (userMenu.state.chat ||
        userMenu.state.templateManager ||
        userMenu.state.snippetsManager) &&
      userMenu.update({ files: true })
    updatePreview(true, css)
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
      {currentDoc?.title && (
        <UserMenu $designerOn={designerOn}>
          <DesignerActions $designerOn={designerOn}>
            <UndoIcon
              onClick={() => onHistory.apply('undo')}
              title="Undo (Ctrl + z)"
            />
            <RedoIcon
              onClick={() => onHistory.apply('redo')}
              title="Redo (Ctrl + y)"
            />
            <RefreshIcon
              onClick={updatePreview}
              title="Update preview"
              type="button"
            />
            <PrinterOutlined
              as="button"
              onClick={() => {
                const body = previewRef?.current?.contentDocument.body
                console.log({
                  body,
                })
                body && (body.style.transform = 'scale(1)')
                body && (body.style.padding = '0')
                body.querySelector('.pagedjs_pages').style.padding = '0'

                const selected = body.querySelectorAll('.selected-id')
                selected.forEach(el => el.classList.remove('selected-id'))

                previewRef?.current?.contentWindow?.print()
                if (body) {
                  selected.forEach(el => el.classList.add('selected-id'))
                  body.querySelector('.pagedjs_pages').style.padding = ''
                  userMenuOpen
                    ? (body.style.transform = 'scale(0.8)')
                    : (body.style.transform = 'scale(1)')
                }
              }}
              title="Print"
              type="button"
            />
          </DesignerActions>
          <FlexRow>
            <EditDesignLabels $active={!designerOn} $activecolor="#222">
              Edit
            </EditDesignLabels>
            <Toggle
              handleChange={() => toggleDesigner()}
              checked={designerOn}
            />
            <EditDesignLabels
              $active={designerOn}
              $activecolor="var(--color-trois)"
            >
              Design
            </EditDesignLabels>
          </FlexRow>
        </UserMenu>
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
