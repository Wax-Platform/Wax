module.exports = {
  clientUrl: 'CLIENT_URL',
  'pubsweet-server': {
    admin: {
      username: 'ADMIN_USERNAME',
      password: 'ADMIN_PASSWORD',
      givenName: 'ADMIN_GIVEN_NAME',
      surname: 'ADMIN_SURNAME',
      email: 'ADMIN_EMAIL',
    },
    port: 'SERVER_PORT',
    secret: 'PUBSWEET_SECRET',
    serveClient: 'SERVER_SERVE_CLIENT',
    publicURL: 'PUBLIC_URL',
    baseURL: 'BASE_URL',
    db: {
      host: 'POSTGRES_HOST',
      port: 'POSTGRES_PORT',
      database: 'POSTGRES_DB',
      user: 'POSTGRES_USER',
      password: 'POSTGRES_PASSWORD',
    },
    wsServerPort: 'WS_SERVER_PORT',
  },
  'password-reset': {
    path: 'PASSWORD_RESET_PATH',
  },
}
