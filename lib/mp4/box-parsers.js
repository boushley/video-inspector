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
  const bytesToRead = fields.reduce((sum, f) => {
    let value
    if (f.length) {
      value = f.length
    } else if (f.lengthBits) {
      value = Math.ceil(f.lengthBits / 8)
    } else if (f.reader.calculateLength) {
      value = f.reader.calculateLength(f)
    }
    return value + sum
  }, 0)
  return (state, box) => {
    box.fields = box.fields || {}
    return new Promise((resolve, reject) => {
      const bufPosition = 0
      // TODO Need to change things around so we can load more data when we need it
      state.read(box.start+8, bytesToRead).then(handleRead).catch(reject)

      function handleRead() {
        let offset = 0
        let bitOffset = 0

        handleField(0)
        function handleField(index) {
          if (index >= fields.length) {
            return resolve(box)
          }

          const f = fields[index]

          const result = f.reader({buf: state.scratch, start: offset, bitOffset, field: f, box, state})
          processResult(result)
          function processResult(result) {
            if (result.then) {
              result.then(processResult)
            } else {
              box.fields[f.name] = result
              const fieldBytesAsBits = parsingPrimitives.evaluateExpression(f.length, box) * 8
              const fieldBits = parsingPrimitives.evaluateExpression(f.lengthBits, box)
              const bits = result.consumedBits || fieldBits || fieldBytesAsBits
              bitOffset += bits
              offset += Math.floor(bitOffset / 8)
              bitOffset = bitOffset % 8
              handleField(index + 1)
            }
          }
        }
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
