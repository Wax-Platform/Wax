const hasRole = (user, role, objectId) => {
  if (!user || !role || !objectId) return false

  const exists = user?.teams?.find(
    t => !t.global && t.role === role && t.objectId === objectId,
  )

  return !!exists
}

const isOwner = (bookId, user) => hasRole(user, 'owner', bookId)

const isCollaborator = (bookId, user) => hasRole(user, 'collaborator', bookId)

const isAdmin = user => {
  const hasGlobalAdminTeams = user?.teams?.find(
    t => t.global && t.role === 'admin',
  )

  return !!hasGlobalAdminTeams
}

const hasEditAccess = (bookId, user) => {
  const { teams } = user
  if (isAdmin(user)) return true

  if (hasRole(user, 'owner', bookId)) return true

  const bookTeam = teams?.find(
    team => team.objectId === bookId && team.role === 'collaborator',
  )

  const teamMember = bookTeam?.members.find(
    member => member.user?.id === user.id,
  )

  return teamMember?.status && teamMember.status === 'write'
}

module.exports = {
  hasRole,
  isOwner,
  isCollaborator,
  hasEditAccess,
  isAdmin,
}
