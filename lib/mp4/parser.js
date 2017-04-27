const fs = require('fs')
const pp = require('./parsing-primitives')

exports.open = function (path) {
  const state = { path }
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      fs.open(path, 'r', (err, descriptor) => {
        if (err) {
          reject(err)
          return
        }

        state.fileSize = stats.size
        state.descriptor = descriptor
        state.scratch = Buffer.alloc(1024)
        state.result = { boxes: [] }

        pp.getBoxes(state, 0, state.fileSize, state.result.boxes)
          .then(() => {
            resolve(state.result)
          }, reject)
      })
    })
  })
}

