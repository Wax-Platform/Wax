const {
  getComments,
  addComments,
  notifyMentions,
} = require('../../../controllers/comments.controller')

const getCommentsResolver = (_, { bookId, chapterId }) => {
  return getComments(bookId, chapterId)
}

const addCommentsResolver = (_, { commentData }) => {
  const { bookId, chapterId, content } = commentData
  return addComments(bookId, chapterId, content) // ctx.user
}

const notifyMentionsResolver = (_, { mentionsData }, ctx) => {
  return notifyMentions(mentionsData, ctx.user)
}

module.exports = {
  Query: {
    getChapterComments: getCommentsResolver,
  },
  Mutation: {
    addComments: addCommentsResolver,
    notifyMentions: notifyMentionsResolver,
  },
}
