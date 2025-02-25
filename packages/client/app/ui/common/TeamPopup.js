/* stylelint-disable declaration-no-important */
import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { BlockPicker } from 'react-color'
import { useCurrentUser } from '@coko/client'
import YjsContext from '../../yjsProvider'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { useApolloClient } from '@apollo/client'
import { useDocumentContext } from '../dashboard/hooks/DocumentContext'
import { CleanButton, FlexCol, FlexRow } from '../_styleds/common'
import {
  CheckOutlined,
  DeleteFilled,
  MailFilled,
  PoweroffOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import { UserAvatar } from '../component-ai-assistant/ChatHistory'

const TeamWrapper = styled.div`
  --profile-picture-size: 18px;
  padding: 0 20px;
  width: 100%;
  z-index: 3;

  h3 {
    color: var(--color-trois-opaque-2);
    font-size: 15px;
    margin: 0 0 8px;
  }

  * {
    font-size: 14px;
  }
`

const OtherUsers = styled.div`
  width: 100%;

  ul {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding-left: 0;
    width: 100%;
  }

  ul > li {
    align-items: center;
    display: flex;
    gap: 10px;
    justify-content: space-between;
    margin-bottom: 5px;
    width: 100%;

    svg {
      fill: var(--color-trois-opaque);
    }
  }
`
const Block = styled(FlexCol)`
  border-bottom: 1px solid #0001;
  padding: 16px 12px;
  width: 100%;
`

const ColoredCircle = styled.div`
  background-color: ${p => p.color};
  border-radius: 3px;
  box-shadow: inset 0 0 5px var(--color-trois-lightest-2);
  height: 18px;
  min-width: ${p => p.size};
  width: 100%;
`

const UsernameText = styled.input`
  background: none;
  border: none;
  border-bottom: 1px solid #0003;
  display: flex;
  height: 20px;
  margin-left: 0;
  width: 100%;

  &:focus {
    border-bottom: 1px solid var(--color-trois-opaque-2);
    outline: none;
  }
`

const ColorBlock = styled.div`
  position: relative;
`
const StyledBlockPicker = styled(BlockPicker)`
  position: absolute !important;
  right: 0;
  top: calc(100% + 20px);
`

const FlexRowCenter = styled(FlexRow)`
  align-items: center;
  gap: 10px;
  width: 100%;
`

const FlexRowCenterFitContent = styled(FlexRow)`
  align-items: center;
  gap: 10px;
  width: fit-content;
`

const FlexRowCenterGap = styled(FlexRow)`
  gap: 10px;
`

const Label = styled.span`
  min-width: 124px;
  padding-left: 10px;
  white-space: nowrap;
`

export const TeamManagerActions = () => {
  const { setCurrentUser } = useCurrentUser()
  const client = useApolloClient()
  const history = useHistory()
  const logout = () => {
    setCurrentUser(null)
    client.cache.reset()
    localStorage.removeItem('token')
    history.push('/login')
  }
  return (
    <CleanButton data-testid="logout-btn" onClick={logout} title="Logout">
      <PoweroffOutlined style={{ fontSize: '18px' }} />
    </CleanButton>
  )
}

const TeamPopup = () => {
  const {
    currentDoc,
    graphQL: { unshareResource, shareResource },
  } = useDocumentContext()
  const [openColorPicker, toggleColorPicker] = useState(false)
  const { currentUser } = useCurrentUser()
  const { updateLocalUser, yjsCurrentUser } = useContext(YjsContext)

  const canUnshare = currentUser?.id === currentDoc?.owner.id

  const handleUnshare = userId => {
    unshareResource({
      variables: {
        resourceId: currentDoc.resourceId,
        userId,
      },
    })
  }

  const sharedWith = currentDoc?.sharedWith || []
  return (
    <TeamWrapper>
      <Block style={{ gap: '5px' }}>
        <h3 style={{ margin: 0 }}>Your Profile:</h3>
        <FlexRowCenter>
          <Label>Name to display:</Label>
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
        </FlexRowCenter>
        <FlexRowCenter>
          <Label>Color to display:</Label>
          <ColoredCircle
            color={yjsCurrentUser.color}
            onClick={() => toggleColorPicker(!openColorPicker)}
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
        </FlexRowCenter>
        {canUnshare && (
          <FlexRowCenter>
            <Label>
              <ShareAltOutlined style={{ fontSize: '14px' }} /> Share with:
            </Label>
            <UsernameText
              type="email"
              placeholder="Enter user email"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  shareResource({
                    variables: {
                      resourceId: currentDoc.resourceId,
                      inviteeEmail: e.target.value,
                    },
                  })
                  e.target.value = ''
                }
              }}
            />
            <CleanButton
              onClick={() => {
                const email = document.querySelector(
                  'input[type="email"]',
                ).value
                shareResource({
                  variables: {
                    resourceId: currentDoc.resourceId,
                    inviteeEmail: email,
                  },
                })
              }}
            >
              <CheckOutlined
                style={{ fontSize: '16px', color: 'var(--color-trois-opaque)' }}
              />
            </CleanButton>
          </FlexRowCenter>
        )}
      </Block>
      <Block>
        <h3>Owner:</h3>
        <FlexRowCenterFitContent>
          <UserAvatar bgColor={currentDoc.owner.color} />
          <span>{currentDoc.owner.displayName}</span>
        </FlexRowCenterFitContent>
      </Block>
      <Block>
        <h3>Shared with:</h3>
        <OtherUsers>
          <ul>
            {sharedWith.map(user => (
              <li key={user.id}>
                <FlexRowCenterFitContent>
                  <UserAvatar bgColor={user.color} />
                  <span>{user.displayName}</span>
                </FlexRowCenterFitContent>
                <FlexRowCenterGap>
                  <a href={`mailto:${user.defaultIdentity.email}`}>
                    <MailFilled style={{ fontSize: '16px' }} />
                  </a>
                  {canUnshare && (
                    <CleanButton onClick={() => handleUnshare(user.id)}>
                      <DeleteFilled style={{ fontSize: '16px' }} />
                    </CleanButton>
                  )}
                </FlexRowCenterGap>
              </li>
            ))}
          </ul>
        </OtherUsers>
      </Block>
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
