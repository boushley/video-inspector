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
  return readCharacters(buf, start, {length: 4})
}
exports.readType = readType

function readCharacters(buf, start, {length}) {
  let type = ''
  for (let i = 0; i < length; i++) {
    type += String.fromCharCode(buf.readUInt8(start + i))
  }
  return type
}
exports.readCharacters = readCharacters

function readBytes(buf, start, {length}) {
  const result = Buffer.from(buf.slice(start, start+length))
  return result
}
exports.readBytes = readBytes

// TODO Shift everything over by the number of bits that should be skipped
function readBits(buf, start, {lengthBits}, bitOffset) {
  const numberBytes = Math.ceil(lengthBits / 8)

  const bytes = readBytes(buf, start, {length: numberBytes}, bitOffset)
  console.log(bytes)

  const remainderBits = 8 - (lengthBits % 8) // the number of bits to shift by
  for (var i = bytes.length - 1; i >= 0; i--) {
    const currentByte = bytes[i]
    const previousByte = bytes[i-1] || 0
    const twoBytes = (previousByte << 8) | currentByte
    bytes[i] = (twoBytes >> remainderBits) & 0xff
  }
  return bytes
}
exports.readBits = readBits

function readNumber(buf, start, {length, lengthBits}, bitOffset) {

  if (length === 1) {
    return buf.readUInt8(start)
  } else if (length === 2) {
    return buf.readUInt16BE(start)
  } else if (length === 4) {
    return buf.readUInt32BE(start)
  } else {
    console.error('Unable to read number of length:', length, 'start:', start)
  }
}
exports.readNumber = readNumber

function readDate(buf, start, {length}) {
  // seconds since midnight, Jan. 1, 1904, in UTC time
  const seconds = readNumber(buf, start, {length})
  // Since JS uses milliseconds since 1970 instead of 1904 subtract off those seconds
  const adjustedSeconds = seconds - 2082844800
  const milliseconds = adjustedSeconds * 1000
  return new Date(milliseconds)
}
exports.readDate = readDate

function fixedPoint(buf, start, {length, divisorPower}) {
  const fullValue = readNumber(buf, start, {length})
  return fullValue / (Math.pow(2, divisorPower))
}
exports.fixedPoint = fixedPoint
