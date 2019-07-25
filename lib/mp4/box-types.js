const boxParsers = require('./box-parsers')
const pp = require('./parsing-primitives')

module.exports = {
  ftyp: boxParsers.staticParser([
    {name: 'majorBrand', length: 4, reader: pp.readCharacters},
    {name: 'minorVersion', length: 4, reader: pp.readNumber},
    {name: 'compatibleBrands0', length: 4, reader: pp.readCharacters},
    {name: 'compatibleBrands1', length: 4, reader: pp.readCharacters},
  ]),
  // TODO Support different versions of this box
  mvhd: boxParsers.fullBox([
    {name: 'creationTime', length: 4, reader: pp.readDate},
    {name: 'modificationTime', length: 4, reader: pp.readDate},
    {name: 'timescale', length: 4, reader: pp.readNumber, description: 'the number of time units that pass in one second'},
    {name: 'duration', length: 4, reader: pp.readNumber, description: 'length of the presentation (in the indicated timescale)'},
    {name: 'rate', length: 4, reader: pp.fixedPoint, divisorPower: 16, description: 'is a fixed point 16.16 number that indicates the preferred rate to play the presentation; 1.0 (0x00010000) is normal forward playback'},
    {name: 'volume', length: 2, reader: pp.fixedPoint, divisorPower: 8, description: 'a fixed point 8.8 number that indicates the preferred playback volume. 1.0 (0x0100) is full volume'},
    {name: 'reserved', length: 10, reader: pp.readBytes},
    {name: 'matrix', length: 36, reader: pp.readBytes, description: 'a transformation matrix for the video; (u,v,w) are restricted here to (0,0,1), hex values (0,0,0x40000000)'},
    {name: 'predefined', length: 24, reader: pp.readBytes},
    {name: 'nextTrackId', length: 4, reader: pp.readNumber, description: 'a non-zero integer that indicates a value to use for the track ID of the next track to be added to this presentation. Zero is not a valid track ID value. The value of next_track_ID shall be larger than the largest track-ID in use. If this value is equal to or larger than all 1s (32-bit maxint), and a new media track is to be added, then a search must be made in the file for a unused track identifier'},
  ]),
  // TODO Support different versions of this box
  tfra: boxParsers.fullBox([
    {name: 'trackId', length: 4, reader: pp.readNumber},
    {name: 'reserved', lengthBits: 26, reader: pp.readBits},
    {name: 'sizeOfTrafNum', lengthBits: 2, reader: pp.readNumber},
    {name: 'sizeOfTrunNum', lengthBits: 2, reader: pp.readNumber},
    {name: 'sizeOfSampleNum', lengthBits: 2, reader: pp.readNumber},
    {name: 'numberOfEntries', length: 4, reader: pp.readNumber},
    {name: 'entries', times: { field: 'numberOfEntries' }, reader: pp.repeater,
      fields: [
        {name: 'time', length: 4, reader: pp.readNumber},
        {name: 'moofOffset', length: 4, reader: pp.readNumber},
        {name: 'trafNumber', length: { field: 'sizeOfTrafNum', add: 1 }, reader: pp.readNumber},
        {name: 'trunNumber', length: { field: 'sizeOfTrunNum', add: 1 }, reader: pp.readNumber},
        {name: 'sampleNumber', length: { field: 'sizeOfSampleNum', add: 1 }, reader: pp.readNumber},
      ]
    },
  ]),
  stts: boxParsers.fullBox([
    {name: 'entryCount', length: 4, reader: pp.readNumber},
    {name: 'entries', times: { field: 'entryCount' }, reader: pp.repeater,
      fields: [
        {name: 'sampleCount', length: 4, reader: pp.readNumber},
        {name: 'dtsDelta', length: 4, reader: pp.readNumber},
      ]
    },
  ]),
  mdia: boxParsers.containerBox,
  mfra: boxParsers.containerBox,
  minf: boxParsers.containerBox,
  moov: boxParsers.containerBox,
  mvex: boxParsers.containerBox,
  stbl: boxParsers.containerBox,
  trak: boxParsers.containerBox,
}
