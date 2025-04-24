module.exports = {
  mode: require.resolve('./authsomeModeVanilla.js'),
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
    copyEditor: {
      name: 'Copy Editor',
      role: 'copyEditor',
      color: {
        addition: '#0ea7b5',
        deletion: '#0ea7b5',
      },
      weight: 2,
    },
    author: {
      name: 'Author',
      role: 'author',
      color: {
        addition: '#e8702a',
        deletion: '#e8702a',
      },
      weight: 3,
    },
  },
}
