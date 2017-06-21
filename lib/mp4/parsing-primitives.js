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
  return readCharacters(buf, {start}, {length: 4})
}
exports.readType = readType

function readCharacters(buf, {start}, {length}) {
  let type = ''
  for (let i = 0; i < length; i++) {
    type += String.fromCharCode(buf.readUInt8(start + i))
  }
  return type
}
exports.readCharacters = readCharacters

function readBytes(buf, {start}, {length}) {
  const result = Buffer.from(buf.slice(start, start+length))
  return result
}
exports.readBytes = readBytes

function readBits(buf, {start, bitOffset}, {lengthBits}) {
  const resultBytes = Math.ceil(lengthBits / 8)
  const inputBytes = Math.ceil((lengthBits+bitOffset) / 8)
  const remainderBits = 8 - (lengthBits % 8)

  const bytes = readBytes(buf, {start, bitOffset}, {length: inputBytes})

  let shiftAmount = remainderBits - bitOffset
  if (shiftAmount < 0) {
    shiftAmount = 8 + shiftAmount
  }
  for (let i = 0; i < resultBytes; i++) {
    const index = bytes.length - i - 1
    const currentByte = bytes[index]
    const previousByte = bytes[index-1] || 0
    const earlierByte = bytes[index-2] || 0
    const twoBytes = (earlierByte << 16) | (previousByte << 8) | currentByte
    bytes[index] = (twoBytes >> shiftAmount) & 0xff
  }

  if (inputBytes !== resultBytes) {
    const firstByte = bytes[1]
    bytes[1] = ((firstByte << remainderBits) & 0xff) >> remainderBits
    return bytes.slice(1)
  } else {
    return bytes
  }
}
exports.readBits = readBits

function readNumber(buf, {start, bitOffset}, {length, lengthBits}, box) {
  let size
  let bytes
  if (lengthBits) {
    bytes = readBits(buf, start, {lengthBits}, bitOffset)
    size = Math.ceil(evaluateExpression(lengthBits, box) / 8)
  } else {
    bytes = buf
    size = evaluateExpression(length, box)
  }

  if (size === 1) {
    return buf.readUInt8(start)
  } else if (size === 2) {
    return buf.readUInt16BE(start)
  } else if (size === 4) {
    return buf.readUInt32BE(start)
  } else {
    console.error('Unable to read number of length:', length, 'start:', start)
  }
}
exports.readNumber = readNumber

function readDate(buf, {start}, {length}) {
  // seconds since midnight, Jan. 1, 1904, in UTC time
  const seconds = readNumber(buf, start, {length})
  // Since JS uses milliseconds since 1970 instead of 1904 subtract off those seconds
  const adjustedSeconds = seconds - 2082844800
  const milliseconds = adjustedSeconds * 1000
  return new Date(milliseconds)
}
exports.readDate = readDate

function fixedPoint(buf, {start}, {length, divisorPower}) {
  const fullValue = readNumber(buf, start, {length})
  return fullValue / (Math.pow(2, divisorPower))
}
exports.fixedPoint = fixedPoint

function evaluateExpression(expression, box) {
  if (typeof expression !== 'object') {
    return expression
  }

  const fieldValue = box.fields[expression.field]
  if (expression.add) {
    return fieldValue + evaluateExpression(expression.add, box)
  } else {
    return fieldValue
  }
}
exports.evaluateExpression = evaluateExpression

function repeater(buf, {start, bitOffset}, {times, fields}, box) {
  const repeatCount = evaluateExpression(times, box)
  const results = []
  for (let i = 0; i < repeatCount; i++) {
    const r = {}
    fields.forEach(f => {
      r[f.name] = f.reader(buf, {start, bitOffset}, f, box)
    })
    results.push(r)
  }
  return results
}
// TODO Can we even do this up gront?
repeater.calculateLength = function({times, fields}) {
  return 50
}
exports.repeater = repeater
