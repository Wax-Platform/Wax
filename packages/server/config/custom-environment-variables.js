module.exports = {
  clientUrl: 'CLIENT_URL',
  admin: {
    username: 'ADMIN_USERNAME',
    password: 'ADMIN_PASSWORD',
    givenName: 'ADMIN_GIVEN_NAME',
    surname: 'ADMIN_SURNAME',
    email: 'ADMIN_EMAIL',
  },
  port: 'SERVER_PORT',
  secret: 'PUBSWEET_SECRET',
  db: {
    host: 'POSTGRES_HOST',
    port: 'POSTGRES_PORT',
    database: 'POSTGRES_DB',
    user: 'POSTGRES_USER',
    password: 'POSTGRES_PASSWORD',
  },
  wsServerPort: 'WS_SERVER_PORT',
  passwordReset: {
    path: 'PASSWORD_RESET_PATH',
  },
  fileStorage: {
    accessKeyId: 'S3_ACCESS_KEY_ID',
    secretAccessKey: 'S3_SECRET_ACCESS_KEY',
    bucket: 'S3_BUCKET',
    url: 'S3_URL',
  },
}
