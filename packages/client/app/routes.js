/* eslint-disable react/function-component-definition */
import React, { useContext, useEffect, useState } from 'react'
import {
  Route,
  Switch,
  Redirect,
  useLocation,
  useHistory,
} from 'react-router-dom'
import styled from 'styled-components'

import {
  Authenticate,
  PageLayout as Page,
  RequireAuth,
  useCurrentUser,
} from '@coko/client'

import GlobalStyles from './globalStyles'
import { Header, VisuallyHiddenElement, Spin, ContextMenu } from './ui/common'

import { YjsProvider } from './yjsProvider'

import {
  Dashboard,
  Login,
  Signup,
  VerifyEmail,
  RequestPasswordReset,
  ResetPassword,
  VerifyCheck,
} from './pages'

import { CURRENT_USER } from './graphql'
import {
  AiDesignerProvider,
  useAiDesignerContext,
} from './ui/component-ai-assistant/hooks/AiDesignerContext'
import { DocumentContextProvider } from './ui/dashboard/hooks/DocumentContext'
const StyledContextMenu = styled(ContextMenu)`
  --svg-fill: var(--color-trois-opaque-2);
  margin: 0;

  li > button {
    gap: 8px;
    padding-block: 2px;

    svg {
      fill: var(--color-trois-opaque);
    }
  }
`
const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 104dvh;
`

const regexPaths = [
  {
    path: /^\/dashboard$/,
    name: 'Dashboard page',
  },
  {
    path: /^\/login+/,
    name: 'Login page',
  },
  {
    path: /^\/signup$/,
    name: 'Signup page',
  },
  {
    path: /^\/email-verification\/[A-Za-z0-9-]+$/,
    name: 'Verify email',
  },
  {
    path: /^\/request-password-reset$/,
    name: 'Request Password Reset page',
  },
  {
    path: /^\/password-reset\/[A-Za-z0-9-]+$/,
    name: 'Reset Password page',
  },
  {
    path: /^\/ensure-verified-login$/,
    name: 'Email Not Verified page',
  },
]

const Layout = props => {
  const { children, id } = props
  const history = useHistory()

  useEffect(() => {
    const path = history.location.pathname
    const title = regexPaths.find(p => p.path.test(path))

    if (title) {
      document.title = `${title?.name} - Wax`
    }

    const unlisten = history.listen(val => {
      const pathName = val.pathname
      const pathTitle = regexPaths.find(p => p.path.test(pathName))

      if (pathTitle) {
        document.getElementById('page-announcement').innerHTML = pathTitle?.name

        document.title = `${pathTitle?.name} - Wax`
      }
    })

    return unlisten
  }, [])

  return (
    <LayoutWrapper id={id}>
      {children}
      <VisuallyHiddenElement
        aria-live="polite"
        as="div"
        id="page-announcement"
        role="status"
      />
    </LayoutWrapper>
  )
}

const StyledPage = styled(Page)`
  height: calc(100dvh);

  > div {
    display: flex;
    /* flex-direction: column; */
    overflow: hidden;
  }

  @media screen and (min-width: 720px) {
    height: ${p => p.$height};
  }
`

const StyledSpin = styled(Spin)`
  display: grid;
  height: 100vh;
  place-content: center;
`

const Loader = () => <StyledSpin spinning />

const SiteHeader = ({ enableLogin }) => {
  const headerLinks = {
    homepage: '/',
    login: '/login',
  }

  const history = useHistory()

  const { currentUser } = useCurrentUser()
  const [currentPath, setCurrentPath] = useState(history.location.pathname)

  useEffect(() => {
    if (!currentUser && history.location.pathname === '/') {
      history.push('/login')
    }
    const unlisten = history.listen(val => setCurrentPath(val.pathname))
    return unlisten
  }, [])

  return currentUser || enableLogin === false ? (
    <Header
      currentPath={currentPath}
      displayName={currentUser?.displayName}
      enableLogin={!!enableLogin}
      links={headerLinks}
      loggedin={!!currentUser}
    />
  ) : null
}

const RequireProfile = ({ children }) => {
  const { pathname } = useLocation()
  const { currentUser } = useCurrentUser()

  if (!currentUser) return null

  if (!currentUser.isActive && pathname !== '/deactivated-user') {
    return <Redirect to="/deactivated-user" />
  }

  return children
}

const Authenticated = ({ children }) => {
  return (
    <RequireAuth notAuthenticatedRedirectTo="/login">
      <RequireProfile>{children}</RequireProfile>
    </RequireAuth>
  )
}

const PageWrapper = props => {
  const { setUserInteractions } = useAiDesignerContext()

  useEffect(() => {
    const keydownHandler = e => {
      setUserInteractions(prev => ({ ...prev, ctrl: e.ctrlKey }))
    }
    const scrollHandler = () => {
      document.querySelector('body').scrollTop = 0
      document.querySelector('html').scrollTop = 0
    }
    window.addEventListener('keydown', keydownHandler)
    window.addEventListener('keyup', keydownHandler)
    window.addEventListener('scroll', scrollHandler)

    return () => {
      window.removeEventListener('keydown', keydownHandler)
      window.removeEventListener('keyup', keydownHandler)
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [])
  return <StyledPage {...props} $height={`calc(100% - 82px)`} />
}

const routes = enableLogin => (
  <DocumentContextProvider>
    <AiDesignerProvider>
      <Layout id="layout-root">
        <GlobalStyles />
        <YjsProvider enableLogin={enableLogin}>
          <SiteHeader enableLogin={enableLogin} />
          <PageWrapper fadeInPages={false} padPages={false}>
            <Switch>
              <Route component={Login} exact path="/login" />
              <Route component={Signup} exact path="/signup" />
              <Route
                component={VerifyEmail}
                exact
                path="/email-verification/:token"
              />
              <Route
                component={RequestPasswordReset}
                exact
                path="/request-password-reset"
              />
              <Route
                component={ResetPassword}
                exact
                path="/password-reset/:token"
              />
              <Route
                component={VerifyCheck}
                exact
                path="/ensure-verified-login"
              />
              <Route
                exact
                path={['/', '/:docIdentifier']}
                render={() =>
                  enableLogin ? (
                    <Authenticated>
                      <Dashboard showFilemanager enableLogin={enableLogin} />
                    </Authenticated>
                  ) : (
                    <Dashboard />
                  )
                }
              />
              <Route render={() => <Redirect to="/login" />} path="*" />
            </Switch>
            <StyledContextMenu />
          </PageWrapper>
        </YjsProvider>
      </Layout>
    </AiDesignerProvider>
  </DocumentContextProvider>
)

export default enableLogin => {
  return enableLogin ? (
    <Authenticate currentUserQuery={CURRENT_USER} loadingComponent={<Loader />}>
      {routes(enableLogin)}
    </Authenticate>
  ) : (
    routes(enableLogin)
  )
}
