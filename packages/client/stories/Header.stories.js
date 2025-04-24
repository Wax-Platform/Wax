/* eslint-disable no-alert */
import React from 'react'
import { faker } from '@faker-js/faker'
import styled from 'styled-components'
import { createData } from './_helpers'
import { Header, UserInviteForm, UserStatus, Modal } from '../app/ui'

const handleLogout = () => alert('logout')
const handleItem = () => alert('item clicked')

const ModalContent = styled.div`
  margin-left: -34px;
`

const handleInvite = () => {
  const fetchUserList = async username => {
    return new Promise(resolve => {
      setTimeout(() => {
        const users = createData(usersCount, () => ({
          id: faker.datatype.uuid(),
          name: faker.name.fullName(),
        }))

        resolve(users)
      }, 1000)
    })
  }

  // const getBookUsers = async () => {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       const usersCount = faker.number.int({ min: 1, max: 10 })

  //       const users = createData(usersCount, () => ({
  //         id: faker.datatype.uuid(),
  //         name: faker.name.fullName(),
  //         avatar: faker.image.avatar(),
  //       }))

  //       resolve(users)
  //     }, 1000)
  //   })
  // }

  const inviteModal = Modal.confirm({
    title: 'Invite',
    closable: true,
    content: (
      <ModalContent>
        <UserInviteForm fetchOptions={fetchUserList} />
      </ModalContent>
    ),
    footer: <UserStatus />,
    width: 600,
  })

  return inviteModal
}

const usersCount = 10

export const BookTitlePage = props => {
  return <Header onInvite={handleInvite} onLogout={handleLogout} {...props} />
}

Header.defaultProps = {
  brandLogoURL: null,
  dropdownItems: [],
  dashboardURL: null,
  backToBookURL: null,
  previewURL: null,
}
BookTitlePage.args = {
  homeURL: '/',
  brandLabel: 'Lulu',
  dashboardURL: '/?path=/story/dashboard-dashboard--base',
  showBackToBook: false,
  showDashboard: true,
  showInvite: false,
  onLogout: handleLogout,
  showPreview: false,
  userDisplayName: faker.name.fullName(),
  dropdownItems: [
    {
      key: 'item1',
      label: 'Item 1',
      onClickHandler: () => handleItem(),
    },
    {
      key: 'item2',
      label: 'Item 2',
      onClickHandler: () => handleItem(),
    },
  ],
}

export const DashboardPage = props => {
  return <Header onInvite={handleInvite} onLogout={handleLogout} {...props} />
}

DashboardPage.args = {
  brandLabel: 'Lulu',
  homeURL: '/',
  showBackToBook: false,
  showDashboard: false,
  showInvite: false,
  showPreview: false,
  userDisplayName: faker.name.fullName(),
  dropdownItems: [
    {
      key: 'item1',
      label: 'Item 1',
      onClickHandler: () => handleItem(),
    },
    {
      key: 'item2',
      label: 'Item 2',
      onClickHandler: () => handleItem(),
    },
  ],
}

export const ImportPage = props => {
  return <Header onInvite={handleInvite} onLogout={handleLogout} {...props} />
}

ImportPage.args = {
  brandLabel: 'Lulu',
  homeURL: '/',
  dashboardURL: '/?path=/story/dashboard-dashboard--base',
  showDashboard: true,
  showBackToBook: false,
  showInvite: false,
  showPreview: false,
  userDisplayName: faker.name.fullName(),
  dropdownItems: [
    {
      key: 'item1',
      label: 'Item 1',
      onClickHandler: () => handleItem(),
    },
    {
      key: 'item2',
      label: 'Item 2',
      onClickHandler: () => handleItem(),
    },
  ],
}

export const ProducerPage = props => {
  return <Header onInvite={handleInvite} onLogout={handleLogout} {...props} />
}

ProducerPage.args = {
  brandLabel: 'Lulu',
  homeURL: '/',
  dashboardURL: '/?path=/story/dashboard-dashboard--base',
  showBackToBook: false,
  showDashboard: true,
  showInvite: true,
  onInvite: handleInvite,
  showPreview: true,
  previewURL: '/?path=/story/dashboard-dashboard--base',
  userDisplayName: faker.name.fullName(),
  dropdownItems: [
    {
      key: 'item1',
      label: 'Item 1',
      onClickHandler: () => handleItem(),
    },
    {
      key: 'item2',
      label: 'Item 2',
      onClickHandler: () => handleItem(),
    },
  ],
}

export const PreviewPage = props => {
  return <Header onInvite={handleInvite} onLogout={handleLogout} {...props} />
}

PreviewPage.args = {
  brandLabel: 'Lulu',
  homeURL: '/',
  dashboardURL: '/?path=/story/dashboard-dashboard--base',
  backToBookURL: '/?path=/story/dashboard-dashboard--base',
  showBackToBook: true,
  showDashboard: true,
  showInvite: false,
  showPreview: false,
  userDisplayName: faker.name.fullName(),
  dropdownItems: [
    {
      key: 'item1',
      label: 'Item 1',
      onClickHandler: () => handleItem(),
    },
    {
      key: 'item2',
      label: 'Item 2',
      onClickHandler: () => handleItem(),
    },
  ],
}

export const WithLogo = props => {
  return <Header onInvite={handleInvite} onLogout={handleLogout} {...props} />
}

WithLogo.args = {
  homeURL: '/',
  dashboardURL: '/?path=/story/dashboard-dashboard--base',
  backToBookURL: '/?path=/story/dashboard-dashboard--base',
  showBackToBook: true,
  showDashboard: true,
  showInvite: false,
  showPreview: false,
  brandLabel: 'Lulu',
  brandLogoURL:
    'https://images.ctfassets.net/9htf9uzhsn4z/3tSSOSmHDmAKXuhUbZD27g/a3af19924d8e4eb75ce6a09514a1f2ea/lulu-logo.svg',
  userDisplayName: faker.name.fullName(),
  dropdownItems: [
    {
      key: 'item1',
      label: 'Item 1',
      onClickHandler: () => handleItem(),
    },
    {
      key: 'item2',
      label: 'Item 2',
      onClickHandler: () => handleItem(),
    },
  ],
}

export default {
  component: Header,
  title: 'Common/Header',
}
