const assert = require('assert')
const pp = require('../lib/mp4/parsing-primitives')

describe('readBits', function() {
  const buffer = Buffer.from([
/*0*/ 0xff, 0xfe, 0xfd, 0xfc, 0xfb,
/*5*/ 0xfa, 0xf9, 0xf8, 0xf7, 0xf6,
/*10*/0xf5, 0xf4, 0xf3, 0xf2, 0xf1,
/*15*/0xf0, 0x00, 0x01, 0x02, 0x03,
/*20*/0x04, 0x05, 0x06, 0x07, 0x08
    ])

  describe('a single bit without bit offsets', function() {
    it('should read some bits', function() {
      const result = pp.readBits(buffer, 1, {lengthBits: 5}, 0)
      assert.equal(0x1f, result[0])
    })
    it('should read some bits when not set', function() {
      const result = pp.readBits(buffer, 15, {lengthBits: 5}, 0)
      assert.equal(0x1e, result[0])
    })
  })

  describe('a couple bytes without bit offsets', function() {
    it('should read some bits', function() {
      const result = pp.readBits(buffer, 0, {lengthBits: 23}, 0)
      console.log(result)
      // from bits:   1111 1111 1111 1110 1111 1101
      // result bits: 0111 1111 1111 1111 0111 1110
      assert.equal(0x7f, result[0])
      assert.equal(0xff, result[1])
      assert.equal(0x7e, result[2])
    })
  })


})
