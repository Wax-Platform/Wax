const config = require('config')

// TODO: this should be moved to @coko/server
const bookInvite = context => {
  const clientUrl = config.get('clientUrl')

  try {
    const { email, bookTitle, sharerEmail, sharerName, bookId, status } =
      context

    const link = `${clientUrl}/books/${bookId}/producer`

    const content = `
        <p>${sharerName} (${sharerEmail}) has invited you to ${status} the following Chapter: <a href="${link}">${bookTitle}</a>.</p>
        <p></p>
        <p>
          If you cannot click the link above, paste the following into your browser to continue:
          <br/>
          ${link}
        </p>
      `

    const text = `
      Chapter shared with you: ${bookTitle}!\nCopy and paste the following link into your browser to view the chapter.\n\n${link}`

    const data = {
      content,
      text,
      subject: `Chapter shared with you: ${bookTitle}`,
      to: email,
    }

    return data
  } catch (e) {
    throw new Error(e)
  }
}

const bookComponentInvite = context => {
  const clientUrl = config.get('clientUrl')

  try {
    const {
      email,
      bookComponentTitle,
      sharerEmail,
      sharerName,
      bookComponentId,
      status,
    } = context

    const link = `${clientUrl}/document/${bookComponentId}`

    const content = `
        <p>${sharerName} (${sharerEmail}) has invited you to ${status} the following chapter: <a href="${link}">${
      bookComponentTitle || 'Untitled'
    }</a>.</p>
        <p></p>
        <p>
          If you cannot click the link above, paste the following into your browser to continue:
          <br/>
          ${link}
        </p>
      `

    const text = `
      Chapter shared with you: ${
        bookComponentTitle || 'Untitled'
      }!\nCopy and paste the following link into your browser to view the chapter.\n\n${link}`

    const data = {
      content,
      text,
      subject: `Chapter shared with you: ${bookComponentTitle || 'Untitled'}`,
      to: email,
    }

    return data
  } catch (e) {
    throw new Error(e)
  }
}

const mentionNotification = context => {
  const clientUrl = config.get('clientUrl')

  try {
    const {
      email,
      bookTitle,
      text: commentText,
      bookId,
      chapterId,
      chapterTitle,
      mentioner,
    } = context

    const link = `${clientUrl}/books/${bookId}/producer#${chapterId}`

    const content = `
      <p>${mentioner} mentioned you in a comment in "${chapterTitle}"</p>
      <p>"${commentText}"</p>
      <p><a href="${link}">Visit the book ${bookTitle}</a> to reply or read more.</p>
      <p>
        If you cannot click the link above, paste the following into your browser to continue:
        <br/>
        ${link}
      </p>
    `

    const text = `
      Someone mentioned you in a comment in the chapter ${bookTitle}!\nCopy and paste the following link into your browser to view the book.\n\n${link}`

    const data = {
      content,
      text,
      subject: `You have been mentioned in the comments of the book "${bookTitle}"`,
      to: email,
    }

    return data
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = { bookInvite, mentionNotification, bookComponentInvite }
