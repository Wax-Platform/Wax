/* stylelint-disable no-descending-specificity */

import React, { useState, useEffect, Suspense, useContext } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import { Route, Switch, useHistory, Redirect } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import { ConfigProvider } from 'antd'
import { CURRENT_USER } from '@coko/client/dist/helpers/currentUserQuery'

import {
  Authenticate,
  PageLayout as Page,
  RequireAuth,
  th,
  useCurrentUser,
  ProviderConnectionPage,
} from '@coko/client'

import theme from './theme'
import { isAdmin } from './helpers/permissions'
import Header from './ui/common/Header'

import {
  ImportPage,
  LoginPage,
  ProducerPage,
  ExporterPage,
  RequestPasswordResetPage,
  RequestVerificationEmailPage,
  UnverifiedUserPage,
  ResetPasswordPage,
  SignupPage,
  VerifyEmailPage,
  AiPDFDesignerPage,
  AdminPage,
  CreateBook,
  KnowledgeBasePage,
  TemplateMananger,
} from './pages'

import { APPLICATION_PARAMETERS } from './graphql'
import { CssAssistantProvider } from './ui/AiPDFDesigner/hooks/CssAssistantContext'
import { GlobalContextProvider } from './helpers/hooks/GlobalContext'

import { YjsProvider } from './ui/provider-yjs/YjsProvider'
import DocumentContext, {
  DocumentProvider,
} from './ui/documentProvider/DocumentProvider'

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const GlobalStyle = createGlobalStyle`
  #root {
    > div.ant-spin-nested-loading {
      height: 100%;

      > div.ant-spin-container {
        height: 100%;
      }
    }

    *:not([contenteditable="true"]) {
      &:focus {
        outline: none;
      }

      &:focus-visible:not(#ai-overlay input) {
        outline: 2px solid ${th('colorOutline')};
      }
    }
  }

  .ant-tooltip .ant-tooltip-arrow::before {
    clip-path: polygon(0 100%, 50% 0%, 100% 100%);
  }

  .ant-modal-confirm-content {
    /* stylelint-disable-next-line declaration-no-important */
    max-width: 100% !important;
  }
`

const Wrapper = props => {
  const { children } = props

  return <LayoutWrapper>{children}</LayoutWrapper>
}

const StyledPage = styled(Page)`
  height: calc(100% - 48px);

  > div {
    padding: 0;
  }
`

const SiteHeader = () => {
  const { title } = useContext(DocumentContext)
  const { currentUser, setCurrentUser } = useCurrentUser()
  const client = useApolloClient()
  const history = useHistory()
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

  const { data: applicationParametersData } = useQuery(APPLICATION_PARAMETERS, {
    fetchPolicy: 'network-only',
  })

  const languages = applicationParametersData?.getApplicationParameters.find(
    c => c.area === 'languages',
  )

  const isExporterPage = currentPath.includes('/exporter')
  const isAiAssistantPage = currentPath.includes('/ai-pdf')
  const isKnowledgeBasePage = currentPath.includes('/knowledge-base')
  const isAdminPage = currentPath.includes('/admin')
  const isTemplatePage = currentPath.includes('/template-manager')

  return (
    <Header
      bookTitle={title}
      brandLabel="wax-platform"
      brandLogoURL="/wax.png"
      canAccessAdminPage={currentUser ? isAdmin(currentUser) : false}
      homeURL="/"
      languages={languages?.config.filter(l => l.enabled)}
      onLogout={logout}
      showBackToBook={
        isExporterPage ||
        isAiAssistantPage ||
        isKnowledgeBasePage ||
        isAdminPage ||
        isTemplatePage
      }
      userDisplayName={currentUser ? currentUser.displayName : ''}
    />
  )
}

const StyledMain = styled.main`
  height: 100%;
`

const RequireVerifiedUser = ({ children }) => {
  const { currentUser } = useCurrentUser()

  if (!currentUser) return <Redirect to="/login" />

  if (!currentUser.isActive || !currentUser.defaultIdentity.isVerified) {
    return <Redirect to="/unverified-user" />
  }

  return children
}

const Authenticated = ({ children }) => {
  return (
    <RequireAuth notAuthenticatedRedirectTo="/login">
      <RequireVerifiedUser>{children}</RequireVerifiedUser>
    </RequireAuth>
  )
}

const routes = (
  <ConfigProvider
    theme={{
      token: theme,
    }}
  >
    <Authenticate currentUserQuery={CURRENT_USER}>
      <GlobalStyle />
      <LayoutWrapper>
        <Wrapper>
          <Suspense fallback={<div>Loading...</div>}>
            <DocumentProvider>
              <SiteHeader />
              <StyledPage fadeInPages>
                <StyledMain id="main-content" tabIndex="-1">
                  <GlobalContextProvider>
                    <YjsProvider>
                      <Switch>
                        <Redirect exact path="/" to="/create-document" />

                        <Route component={SignupPage} exact path="/signup" />
                        <Route component={LoginPage} exact path="/login" />

                        <Route
                          component={RequestPasswordResetPage}
                          exact
                          path="/request-password-reset"
                        />
                        <Route
                          component={ResetPasswordPage}
                          exact
                          path="/password-reset/:token"
                        />
                        <Route
                          component={VerifyEmailPage}
                          exact
                          path="/email-verification/:token"
                        />
                        <Route
                          component={UnverifiedUserPage}
                          exact
                          path="/unverified-user/"
                        />
                        <Route
                          component={RequestVerificationEmailPage}
                          exact
                          path="/request-verification-email/"
                        />
                        <Route
                          exact
                          path="/create-document"
                          render={() => (
                            <Authenticated>
                              <CreateBook />
                            </Authenticated>
                          )}
                        />
                        <Route
                          exact
                          path="/books/:bookId/import"
                          render={() => (
                            <Authenticated>
                              <ImportPage />
                            </Authenticated>
                          )}
                        />
                        <Route
                          exact
                          path="/document/:bookComponentId"
                          render={() => (
                            <Authenticated>
                              <ProducerPage />
                            </Authenticated>
                          )}
                        />

                        <Route exact path="/books/:bookId/exporter">
                          <Authenticated>
                            <ExporterPage />
                          </Authenticated>
                        </Route>

                        <Route exact path="/books/:bookId/ai-pdf">
                          <Authenticated>
                            <CssAssistantProvider>
                              <AiPDFDesignerPage />
                            </CssAssistantProvider>
                          </Authenticated>
                        </Route>

                        <Route exact path="/books/:bookId/knowledge-base">
                          <Authenticated>
                            <KnowledgeBasePage />
                          </Authenticated>
                        </Route>

                        <Route exact path="/provider-redirect/:provider">
                          <ProviderConnectionPage closeOnSuccess />
                        </Route>

                        <Route exact path="/admin">
                          <Authenticated>
                            <AdminPage />
                          </Authenticated>
                        </Route>
                        <Route exact path="/template-manager">
                          <Authenticated>
                            <TemplateMananger />
                          </Authenticated>
                        </Route>

                        <Route exact path="/document/:bookComponentId/exporter">
                          <Authenticated>
                            <ExporterPage />
                          </Authenticated>
                        </Route>

                        <Route exact path="/books/:bookId/ai-pdf">
                          <Authenticated>
                            <CssAssistantProvider>
                              <AiPDFDesignerPage />
                            </CssAssistantProvider>
                          </Authenticated>
                        </Route>

                        <Route exact path="/books/:bookId/knowledge-base">
                          <Authenticated>
                            <KnowledgeBasePage />
                          </Authenticated>
                        </Route>

                        <Route exact path="/provider-redirect/:provider">
                          <ProviderConnectionPage closeOnSuccess />
                        </Route>

                        <Route exact path="/admin">
                          <Authenticated>
                            <AdminPage />
                          </Authenticated>
                        </Route>
                        <Route exact path="/template-manager">
                          <Authenticated>
                            <TemplateMananger />
                          </Authenticated>
                        </Route>
                      </Switch>
                    </YjsProvider>
                  </GlobalContextProvider>
                </StyledMain>
              </StyledPage>
            </DocumentProvider>
          </Suspense>
        </Wrapper>
      </LayoutWrapper>
    </Authenticate>
  </ConfigProvider>
)

export default routes
