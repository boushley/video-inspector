const fs = require('fs')
const parsingPrimitives = require('./parsing-primitives')

function containerBox(state, box) {
  return new Promise((resolve, reject) => {
    box.boxes = []
    parsingPrimitives.getBoxes(state, box.start + 8, box.end, box.boxes)
      .then(() => resolve(box), reject)
  })
}
exports.containerBox = containerBox

function staticParser(fields) {
  const bytesToRead = fields.reduce((sum, f) => sum + f.length, 0)
  return (state, box) => {
    return new Promise((resolve, reject) => {
      const bufPosition = 0
      fs.read(state.descriptor, state.scratch, bufPosition, bytesToRead, box.start+8, handleRead)

      function handleRead(err) {
        if (err) {
          reject(err)
          return
        }

        let offset = 0
        fields.forEach(f => {
          box[f.name] = f.reader(state.scratch, offset, f.length)
          offset += f.length
        })
        resolve(box)
      }
    })
  }
}
exports.staticParser = staticParser
