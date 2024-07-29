/* eslint-disable react/function-component-definition */
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import {
  Route,
  Switch,
  Redirect,
  useLocation,
  useHistory,
} from 'react-router-dom'
import brushIcon from '../static/brush-icon.svg'
import dropperIcon from '../static/dropper-icon.svg'
import styled from 'styled-components'

import {
  Authenticate,
  PageLayout as Page,
  RequireAuth,
  useCurrentUser,
} from '@coko/client'

import GlobalStyles from './globalStyles'
import { Header, VisuallyHiddenElement, Spin } from './ui/common'

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
  AiDesignerContext,
  AiDesignerProvider,
} from './ui/component-ai-assistant/hooks/AiDesignerContext'

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
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
  height: calc(100% - 90px);

  > div {
    display: flex;
    flex-direction: column;
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

// eslint-disable-next-line react/prop-types
const SiteHeader = ({ enableLogin }) => {
  const headerLinks = {
    homepage: '/',
    login: '/login',
  }

  const history = useHistory()

  const { currentUser, setCurrentUser } = useCurrentUser()
  const client = useApolloClient()
  const [currentPath, setCurrentPath] = useState(history.location.pathname)

  useEffect(() => {
    const unlisten = history.listen(val => setCurrentPath(val.pathname))

    return unlisten
  }, [])

  const logout = () => {
    setCurrentUser(null)
    client.cache.reset()

    localStorage.removeItem('token')
    history.push('/login')
  }

  return currentUser || enableLogin === false ? (
    <Header
      currentPath={currentPath}
      displayName={currentUser?.displayName}
      enableLogin={!!enableLogin}
      links={headerLinks}
      loggedin={!!currentUser}
      onLogout={logout}
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
  const { setUserInteractions } = useContext(AiDesignerContext)
  useEffect(() => {
    const keydownHandler = e => {
      console.log(e.ctrlKey)
      setUserInteractions(prev => ({ ...prev, ctrl: e.ctrlKey }))
    }
    window.addEventListener('keydown', keydownHandler)
    window.addEventListener('keyup', keydownHandler)

    return () => {
      window.removeEventListener('keydown', keydownHandler)
      window.removeEventListener('keyup', keydownHandler)
    }
  }, [])
  return <StyledPage {...props} $height={`calc(100% - 82px)`} />
}

const routes = enableLogin => (
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
                    <Dashboard showFilemanager />
                  </Authenticated>
                ) : (
                  <Dashboard />
                )
              }
            />
            <Route component={() => <Redirect to="/" />} path="*" />
          </Switch>
        </PageWrapper>
      </YjsProvider>
    </Layout>
  </AiDesignerProvider>
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
