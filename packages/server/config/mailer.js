const { MAILER_HOSTNAME, MAILER_USER, MAILER_PASSWORD, MAILER_PORT } =
  process.env

module.exports = {
  transport: {
    host: MAILER_HOSTNAME,
    PORT: MAILER_PORT,
    auth: {
      user: MAILER_USER,
      pass: MAILER_PASSWORD,
    },
  },
}
