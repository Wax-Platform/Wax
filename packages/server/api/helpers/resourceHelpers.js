const { useTransaction } = require('@coko/server')

const createResourcesForTemplates = async ({
  category,
  folderName,
  extension,
  userId,
  options = {},
}) => {
  const ResourceTree = require('../../models/resourceTree/resourceTree.model')
  const Template = require('../../models/template/template.model')

  const { trx } = options
  return useTransaction(
    async tr => {
      const templates = await Template.query(tr)
        .where('category', category)
        .andWhere('userId', userId)

      const resourceIds = await Promise.all(
        templates.map(async template => {
          const resource = await ResourceTree.query(tr).insert({
            title: template.displayName,
            extension,
            resourceType: extension === 'snip' ? 'snippet' : 'template',
            templateId: template.id,
            userId: template.userId,
          })

          return resource.id
        }),
      )

      const templatesFolder = await ResourceTree.query(tr).findOne({
        resourceType: 'sys',
        title: 'Templates',
        userId,
      })

      if (templatesFolder) {
        const createFolder = await ResourceTree.query(tr).insert({
          title: folderName,
          extension,
          resourceType: 'sys',
          userId,
          children: resourceIds,
          parentId: templatesFolder.id,
        })

        await ResourceTree.query(tr)
          .whereIn('id', resourceIds)
          .patch({ parentId: createFolder.id })

        await ResourceTree.query(tr).patchAndFetchById(templatesFolder.id, {
          children: templatesFolder.children
            ? [...templatesFolder.children, createFolder.id]
            : [createFolder.id],
        })
      } else {
        throw new Error(`Root folder 'Templates' not found for user ${userId}`)
      }
    },
    { trx, passedTrxOnly: true },
  )
}

module.exports = createResourcesForTemplates
