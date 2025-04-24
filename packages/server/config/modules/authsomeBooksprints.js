module.exports = {
  mode: require.resolve('./authsomeModeBooksprints.js'),
  teams: {
    productionEditor: {
      name: 'Production Editor',
      role: 'productionEditor',
      color: {
        addition: '#0c457d',
        deletion: '#0c457d',
      },
      weight: 1,
    },
    author: {
      name: 'Author',
      role: 'author',
      color: {
        addition: '#e8702a',
        deletion: '#e8702a',
      },
      weight: 2,
    },
  },
}
