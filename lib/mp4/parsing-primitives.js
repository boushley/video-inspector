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
    function handleRead() {
      const size = state.scratch.readUInt32BE(0)
      const box = {
        size,
        type: readType(state.scratch, 4),
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

    const bytesToRead = 8
    state.read(start, bytesToRead).then(handleRead)
  })
}
exports.readBox = readBox

function readType(buf, start) {
  return readCharacters({buf, start, field: {length: 4}})
}
exports.readType = readType

function readCharacters({buf, start, field: {length}}) {
  let type = ''
  for (let i = 0; i < length; i++) {
    type += String.fromCharCode(buf.readUInt8(start + i))
  }
  return type
}
exports.readCharacters = readCharacters

function readBytes({buf, start, field: {length}}) {
  const result = Buffer.from(buf.slice(start, start+length))
  return result
}
exports.readBytes = readBytes

function readBits({buf, start, bitOffset, field: {lengthBits}}) {
  const resultBytes = Math.ceil(lengthBits / 8)
  const inputBytes = Math.ceil((lengthBits+bitOffset) / 8)
  const remainderBits = 8 - (lengthBits % 8)

  const bytes = readBytes({buf, start, bitOffset, field: {length: inputBytes}})

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

function readNumber({buf, start, bitOffset, box, field: {length, lengthBits}}) {
  let size
  let bytes
  if (lengthBits) {
    bytes = readBits({buf, start, field: {lengthBits}, bitOffset})
    size = Math.ceil(ee(lengthBits, box) / 8)
  } else {
    bytes = buf
    size = ee(length, box)
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

function readDate({buf, start, field: {length}}) {
  // seconds since midnight, Jan. 1, 1904, in UTC time
  const seconds = readNumber({buf, start, field: {length}})
  // Since JS uses milliseconds since 1970 instead of 1904 subtract off those seconds
  const adjustedSeconds = seconds - 2082844800
  const milliseconds = adjustedSeconds * 1000
  return new Date(milliseconds)
}
exports.readDate = readDate

function fixedPoint({buf, start, field: {length, divisorPower}}) {
  const fullValue = readNumber({buf, start, field: {length}})
  return fullValue / (Math.pow(2, divisorPower))
}
exports.fixedPoint = fixedPoint

function ee(expression, box) {
  if (typeof expression !== 'object') {
    return expression
  }

  const fieldValue = box.fields[expression.field]
  if (expression.add) {
    return fieldValue + ee(expression.add, box)
  } else {
    return fieldValue
  }
}
exports.evaluateExpression = ee

// TODO The field iteration in here is very similar to what we do in
// box-parsers#staticParser we should figure out how to share that, especially
// since the staticParser iterator is more robust
function repeater(options) {
  const {buf, start, bitOffset: startBitOffset, box, field: {times, fields}} = options
  const repeatCount = ee(times, box)
  const results = []
  let offset = start
  let bitOffset = startBitOffset
  // TODO Iterate these async so we can handle needing to read more data to handle the
  // repeated item. That also means we need to return a promise.
  // When we return the promise ass the `consumedBits` property to the result so that
  // the staticParser iterator can know where we stand
  for (let i = 0; i < repeatCount; i++) {
    const r = {}
    fields.forEach(f => {
      const newOptions = Object.assign({}, options, {start: offset, bitOffset: bitOffset, field: f})
      r[f.name] = f.reader(newOptions)
      const fieldBytesAsBits = ee(f.length, box) * 8
      const fieldBits = ee(f.lengthBits, box)
      const bits = fieldBits || fieldBytesAsBits
      bitOffset += bits
      offset += Math.floor(bitOffset / 8)
      bitOffset = bitOffset % 8
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
