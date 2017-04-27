const fs = require('fs')

function getBoxes(state, pos, end, boxArray) {
  return new Promise((resolve, reject) => {
    function getBoxesInternal(start, end) {
      readBox(state, start).then(function(box) {
        boxArray.push(box)
        if (box.end >= end) {
          resolve()
        } else {
          getBoxesInternal(box.end, end)
        }
      }, reject)
    }
    getBoxesInternal(pos, end)
  })
}
exports.getBoxes = getBoxes

function readBox(state, start) {
  return new Promise((resolve, reject) => {
    function handleRead(err, bytesRead, buf) {
      const size = buf.readUInt32BE(0)
      const box = {
        size,
        type: readType(buf, 4),
        start,
        end: start + size
      }

      const boxParser = require('./box-types')[box.type]
      if (boxParser) {
        boxParser(state, box).then(resolve, reject)
      } else {
        resolve(box)
      }
    }

    const bufPosition = 0
    const bytesToRead = 8
    fs.read(state.descriptor, state.scratch, bufPosition, bytesToRead, start, handleRead)
  })
}
exports.readBox = readBox

function readType(buf, start) {
  return readCharacters(buf, start, 4)
}
exports.readType = readType

function readCharacters(buf, start, length) {
  let type = ''
  for (let i = 0; i < length; i++) {
    type += String.fromCharCode(buf.readUInt8(start + i))
  }
  return type
}
exports.readCharacters = readCharacters

function readNumber(buf, start, length) {
  if (length === 1) {
    return buf.readUInt8(start)
  } else if (length === 2) {
    return buf.readUInt16BE(start)
  } else if (length === 4) {
    return buf.readUInt32BE(start)
  } else {
    console.error('Unable to read number of length:', length)
  }
}
exports.readNumber = readNumber
