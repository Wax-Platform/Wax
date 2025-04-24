const { useTransaction, uuid } = require('@coko/server')
const cheerio = require('cheerio')

const { camelCaseToKebabCase } = require('../../utilities/generic')
const BookComponentTranslation = require('../../models/bookComponentTranslation/bookComponentTranslation.model')

const sectionLevelClassCreator = totalNumberOfLevels =>
  totalNumberOfLevels === 4 ? 'level-three' : 'level-two'

const getTitleOrDefault = (title = undefined) => {
  if (!title) {
    return 'Section Title'
  }

  if (title.trim() === '' && title === 'Undefined') {
    return 'Section Title'
  }

  return title
}

const getH1TitleOrDefault = (title, componentType) => {
  if (!title || title.trim() === '') {
    return componentType === 'part' ? 'Part Title' : 'Chapter Title'
  }

  return title
}

const bookComponentContentCreator = async (
  bookComponent,
  title,
  bookStructure,
  level,
  indexes = {},
  options = {},
) => {
  const { trx, languageIso } = options

  const h1Title = getH1TitleOrDefault(title, bookComponent.componentType)

  const container = cheerio.load(
    `<html><body><h1>${h1Title}</h1></body></html>`,
  )

  try {
    return useTransaction(
      async tr => {
        let content

        if (bookStructure.levels.length === 3) {
          const { levelOneIndex } = indexes

          if (levelOneIndex !== undefined) {
            bookStructure.levels[level].contentStructure.forEach(
              contentItem => {
                if (contentItem.type === 'contentOpenerImage') {
                  container('body').append(
                    `<div id="${
                      contentItem.type
                    }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                      contentItem.type,
                    )}"></div>`,
                  )
                } else if (contentItem.type !== 'mainContent') {
                  container('body').append(
                    `<div id="${
                      contentItem.type
                    }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                      contentItem.type,
                    )}"></div>`,
                  )
                }
              },
            )
            bookStructure.outline[levelOneIndex].children.forEach(
              outlineLevelTwoItem => {
                container('body').append(
                  `<section id="${level}-${
                    outlineLevelTwoItem.id
                  }" data-type="content_structure_element" class="${sectionLevelClassCreator(
                    bookStructure.levels.length,
                  )} ${camelCaseToKebabCase(
                    outlineLevelTwoItem.type,
                  )}"><h2>${getTitleOrDefault(
                    outlineLevelTwoItem.title,
                  )}</h2></section>`,
                )
                bookStructure.levels[level + 1].contentStructure.forEach(
                  contentItem => {
                    if (contentItem.type === 'contentOpenerImage') {
                      container(`#${level}-${outlineLevelTwoItem.id}`).append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    } else if (contentItem.type !== 'mainContent') {
                      container(`#${level}-${outlineLevelTwoItem.id}`).append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    }
                  },
                )
              },
            )

            bookStructure.levels[level + 2].contentStructure.forEach(
              contentItem => {
                if (
                  contentItem.type === 'mainContent' ||
                  contentItem.type === 'contentOpenerImage'
                ) {
                  container('body').append(
                    `<div id="${
                      contentItem.type
                    }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                      contentItem.type,
                    )}"></div>`,
                  )
                } else {
                  container('body').append(
                    `<div id="${
                      contentItem.type
                    }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                      contentItem.type,
                    )}"></div>`,
                  )
                }
              },
            )
            content = container('body').html()
          } else {
            bookStructure.levels[level].contentStructure.forEach(
              contentItem => {
                if (contentItem.type === 'contentOpenerImage') {
                  container('body').append(
                    `<div id="${
                      contentItem.type
                    }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                      contentItem.type,
                    )}"></div>`,
                  )
                } else if (contentItem.type !== 'mainContent') {
                  container('body').append(
                    `<div id="${
                      contentItem.type
                    }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                      contentItem.type,
                    )}"></div>`,
                  )
                }
              },
            )
            bookStructure.outline[level].children.forEach(
              outlineLevelTwoItem => {
                container('body').append(
                  `<section id="${level}-${
                    outlineLevelTwoItem.id
                  }" data-type="content_structure_element" class="${sectionLevelClassCreator(
                    bookStructure.levels.length,
                  )} ${camelCaseToKebabCase(
                    outlineLevelTwoItem.type,
                  )}"><h2>${getTitleOrDefault()}</h2></section>`,
                )
                bookStructure.levels[level + 1].contentStructure.forEach(
                  contentItem => {
                    if (contentItem.type === 'contentOpenerImage') {
                      container(`#${level}-${outlineLevelTwoItem.id}`).append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    } else if (contentItem.type !== 'mainContent') {
                      container(`#${level}-${outlineLevelTwoItem.id}`).append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    }
                  },
                )
              },
            )

            bookStructure.levels[level + 2].contentStructure.forEach(
              contentItem => {
                if (
                  contentItem.type === 'mainContent' ||
                  contentItem.type === 'contentOpenerImage'
                ) {
                  container('body').append(
                    `<div id="${
                      contentItem.type
                    }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                      contentItem.type,
                    )}"></div>`,
                  )
                } else {
                  container('body').append(
                    `<div id="${
                      contentItem.type
                    }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                      contentItem.type,
                    )}"></div>`,
                  )
                }
              },
            )
            content = container('body').html()
          }
        }

        if (bookStructure.levels.length === 4) {
          const { levelOneIndex, levelTwoIndex } = indexes

          if (levelOneIndex !== undefined && levelTwoIndex !== undefined) {
            // use case of creation from book finalized
            if (level === 0) {
              bookStructure.levels[level].contentStructure.forEach(
                contentItem => {
                  if (contentItem.type === 'contentOpenerImage') {
                    container('body').append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  } else if (contentItem.type !== 'mainContent') {
                    container('body').append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  }
                },
              )
            }

            if (level === 1) {
              bookStructure.levels[level].contentStructure.forEach(
                contentItem => {
                  if (contentItem.type === 'contentOpenerImage') {
                    container('body').append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  } else if (contentItem.type !== 'mainContent') {
                    container('body').append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  }
                },
              )
              bookStructure.outline[levelOneIndex].children[
                levelTwoIndex
              ].children.forEach(outlineLevelThreeItem => {
                container('body').append(
                  `<section id="${level}-${
                    outlineLevelThreeItem.id
                  }" data-type="content_structure_element" class="${sectionLevelClassCreator(
                    bookStructure.levels.length,
                  )} ${camelCaseToKebabCase(
                    outlineLevelThreeItem.type,
                  )}"><h2>${getTitleOrDefault(
                    outlineLevelThreeItem.title,
                  )}</h2></section>`,
                )
                bookStructure.levels[level + 1].contentStructure.forEach(
                  contentItem => {
                    if (contentItem.type === 'contentOpenerImage') {
                      container(`#${level}-${outlineLevelThreeItem.id}`).append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    } else if (contentItem.type !== 'mainContent') {
                      container(`#${level}-${outlineLevelThreeItem.id}`).append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    }
                  },
                )
              })

              // Case of level two closers after level three
              if (bookStructure.levels.length >= 3) {
                bookStructure.levels[level + 2].contentStructure.forEach(
                  contentItem => {
                    if (
                      contentItem.type === 'mainContent' ||
                      contentItem.type === 'contentOpenerImage'
                    ) {
                      container('body').append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    } else {
                      container('body').append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    }
                  },
                )
              }
            }
          } else {
            // use case of creation from book builder
            if (level === 0) {
              bookStructure.levels[level].contentStructure.forEach(
                contentItem => {
                  if (contentItem.type === 'contentOpenerImage') {
                    container('body').append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  } else if (contentItem.type !== 'mainContent') {
                    container('body').append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  }
                },
              )
            }

            if (level === 1) {
              bookStructure.levels[level].contentStructure.forEach(
                contentItem => {
                  if (contentItem.type === 'contentOpenerImage') {
                    container('body').append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  } else if (contentItem.type !== 'mainContent') {
                    container('body').append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  }
                },
              )
              const levelThreeItemId = uuid()
              container('body').append(
                `<section id="${level}-${levelThreeItemId}" data-type="content_structure_element" class="${sectionLevelClassCreator(
                  bookStructure.levels.length,
                )} ${camelCaseToKebabCase(
                  bookStructure.levels[level + 1].type,
                )}"><h2>${getTitleOrDefault()}</h2></section>`,
              )

              bookStructure.levels[level + 1].contentStructure.forEach(
                contentItem => {
                  if (contentItem.type === 'contentOpenerImage') {
                    container(`#${level}-${levelThreeItemId}`).append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  } else if (contentItem.type !== 'mainContent') {
                    container(`#${level}-${levelThreeItemId}`).append(
                      `<div id="${
                        contentItem.type
                      }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                        contentItem.type,
                      )}"></div>`,
                    )
                  }
                },
              )

              // Case of level two closers after level three
              if (bookStructure.levels.length >= 3) {
                bookStructure.levels[level + 2].contentStructure.forEach(
                  contentItem => {
                    if (
                      contentItem.type === 'mainContent' ||
                      contentItem.type === 'contentOpenerImage'
                    ) {
                      container('body').append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    } else {
                      container('body').append(
                        `<div id="${
                          contentItem.type
                        }-${uuid()}" data-type="content_structure_element" class="${camelCaseToKebabCase(
                          contentItem.type,
                        )}"></div>`,
                      )
                    }
                  },
                )
              }
            }
          }

          content = container('body').html()
        }

        const bookComponentTranslation = await BookComponentTranslation.query(
          tr,
        ).findOne({
          bookComponentId: bookComponent.id,
          languageIso: languageIso || 'en',
        })

        return BookComponentTranslation.patchAndFetchById(
          bookComponentTranslation.id,
          { content },
          { trx: tr },
        )
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = bookComponentContentCreator
