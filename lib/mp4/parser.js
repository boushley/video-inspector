const fs = require('fs')
const pp = require('./parsing-primitives')

const BUFFER_SIZE = 1024

exports.open = function (path) {
  const reader = new StatefulReader(path)
  return reader.process()
}

function StatefulReader(path) {
  this.path = path
}

StatefulReader.prototype.process = function() {
  return new Promise((resolve, reject) => {
    fs.stat(this.path, (err, stats) => {
      if (err) {
          reject(err)
          return
      }

      fs.open(this.path, 'r', (err, descriptor) => {
        if (err) {
          reject(err)
          return
        }

        this.bufPosition = 0
        this.fileSize = stats.size
        this.descriptor = descriptor
        this.scratch = Buffer.alloc(BUFFER_SIZE)
        this.result = { boxes: [] }

        pp.getBoxes(this, 0, this.fileSize, this.result.boxes)
          .then(() => {
            resolve(this.result)
          }, reject)
      })
    })
  })
}

StatefulReader.prototype.read = function(start, bytesToRead) {
  return new Promise((resolve, reject) => {
    if (bytesToRead > BUFFER_SIZE) {
      return reject(new Error(`Cannot read ${bytesToRead} bytes it's larger than ${BUFFER_SIZE}`))
    }
    fs.read(this.descriptor, this.scratch, this.bufPosition, bytesToRead, start, (err, bytesRead, buf) => {
      if (err) {
        reject(err)
      } else {
        resolve(buf)
      }
    })
  })
}

