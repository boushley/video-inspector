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
    box.fields = box.fields || {}
    return new Promise((resolve, reject) => {
      const bufPosition = 0
      fs.read(state.descriptor, state.scratch, bufPosition, bytesToRead, box.start+8, handleRead)

      function handleRead(err) {
        if (err) {
          reject(err)
          return
        }

        let offset = 0
        let bitOffset = 0
        fields.forEach(f => {
          box.fields[f.name] = f.reader(state.scratch, offset, f, bitOffset)
          const bits = f.lengthBits || (f.length * 8)
          bitOffset += bits
          offset += Math.floor(bitOffset / 8)
          bitOffset = bitOffset % 8
        })
        resolve(box)
      }
    })
  }
}
exports.staticParser = staticParser

function fullBox(fields) {
  fields.unshift({name: 'version', length: 1, reader: parsingPrimitives.readNumber}, {name: 'flags', length: 3, reader: parsingPrimitives.readBytes})
  return staticParser(fields)
}
exports.fullBox = fullBox
