/* eslint-disable */ 

const populate = require('mongolass-plugin-populate')

// built-in plugins
const options = ['limit', 'sort', 'projection', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout', 'tailable', 'batchSize', 'returnKey', 'maxScan', 'min', 'max', 'showDiskLoc', 'comment', 'raw', 'promoteLongs', 'promoteValues', 'promoteBuffers', 'readPreference', 'partial', 'maxTimeMS', 'collation', 'session']

options.forEach(function (key) {
  exports[key] = {
    beforeFind: function beforeFind (value) {
      bindOption.call(this, key, value)
    },
    beforeFindOne: function beforeFindOne (value) {
      bindOption.call(this, key, value)
    }
  }
})

exports.select = exports.projection

// .populate({ path: 'xxx', match: { ... }, select: { xx: 1 }, model: 'User', options: {} })
exports.populate = populate

function bindOption (key, value) {
  if (this._args.length === 0) {
    this._args.push({}, {})
  } else if (this._args.length === 1) {
    this._args.push({})
  }
  this._args[1][key] = value
}
