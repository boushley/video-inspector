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

  describe('without a bit offset', function() {
    it('should read some bits', function() {
      const result = pp.readBits(buffer, 1, {lengthBits: 5}, 0)
      assert.equal(result[0], 0x1f)
      assert.equal(result.length, 1)
    })
    it('should read some bits regardless of their value', function() {
      const result = pp.readBits(buffer, 15, {lengthBits: 5}, 0)
      assert.equal(result[0], 0x1e)
      assert.equal(result.length, 1)
    })

    it('should read multiple bytes', function() {
      const result = pp.readBits(buffer, 0, {lengthBits: 23}, 0)
      // from bits:   1111 1111 1111 1110 1111 1101
      // result bits: 0111 1111 1111 1111 0111 1110
      assert.equal(result[0], 0x7f)
      assert.equal(result[1], 0xff)
      assert.equal(result[2], 0x7e)
      assert.equal(result.length, 3)
    })
  })

  describe('with bit offset', function() {
    it('should read multiple bytes', function() {
      const result = pp.readBits(buffer, 1, {lengthBits: 22}, 4)
      //                   |-- should select these --|
      // from bits:   1111 1110 1111 1101 1111 1100 1111 1011
      // result bits: 0011 1011 1111 0111 1111 0011
      assert.equal(result[0], 0x3b)
      assert.equal(result[1], 0xf7)
      assert.equal(result[2], 0xf3)
      assert.equal(result.length, 3)
    })
    it('should read multiple different bytes', function() {
      const result = pp.readBits(buffer, 16, {lengthBits: 23}, 1)
      //               |-- should select these  --|
      // from bits:   0000 0000 0000 0001 0000 0010
      // result bits: 0000 0000 0000 0001 0000 0010
      assert.equal(result[0], 0x00)
      assert.equal(result[1], 0x01)
      assert.equal(result[2], 0x02)
      assert.equal(result.length, 3)
    })
  })


})
