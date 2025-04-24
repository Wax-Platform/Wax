/* eslint-disable jest/no-commented-out-tests */
// const {
//   ketidaDataModel: {
//     models: { User },
//   },
// } = require('../../data-model')

// const { BookCollection, Lock } = require('../../data-model/src').models
// const { dbCleaner } = require('pubsweet-server/test')

// let collection, user

// describe('Lock', () => {
//   beforeEach(async () => {
//     await dbCleaner()

//     user = await new User({
//       email: 'email@email.com',
//       password: 'password',
//       username: 'user',
//     }).save()

//     collection = await BookCollection.query().insert({})
//   })

//   it('can create a lock', async () => {
//     const lock = await Lock.query().insert({
//       foreignId: collection.id,
//       foreignType: collection.type,
//       userId: user.id,
//     })

//     expect(lock).toHaveProperty('id')
//   })

//   it('can remove a lock', async () => {
//     const lock = await Lock.query().insert({
//       foreignId: collection.id,
//       foreignType: collection.type,
//       userId: user.id,
//     })

//     await Lock.query().deleteById(lock.id)

//     const findLock = await Lock.query().findOne({
//       foreignId: collection.id,
//     })

//     expect(findLock).toBeUndefined()
//   })

//   it('fails when given an invalid foreign type', async () => {
//     const createLock = async () => {
//       await Lock.query().insert({
//         foreignId: collection.id,
//         foreignType: 'bookTranslation',
//         userId: user.id,
//       })
//     }

//     await expect(createLock()).rejects.toBeInstanceOf(Error)
//   })

//   it('cannot create a lock without a user id', async () => {
//     const createLock = async () => {
//       await Lock.query().insert({
//         foreignId: collection.id,
//         foreignType: 'bookTranslation',
//       })
//     }

//     await expect(createLock()).rejects.toBeInstanceOf(Error)
//   })

//   it('cannot create a lock without a foreign id', async () => {
//     const createLock = async () => {
//       await Lock.query().insert({
//         foreignType: 'bookTranslation',
//         userId: user.id,
//       })
//     }

//     await expect(createLock()).rejects.toBeInstanceOf(Error)
//   })

//   it('cannot create a lock without a foreign type', async () => {
//     const createLock = async () => {
//       await Lock.query().insert({
//         foreignId: collection.id,
//         userId: user.id,
//       })
//     }

//     await expect(createLock()).rejects.toBeInstanceOf(Error)
//   })
// })
