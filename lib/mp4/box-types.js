const boxParsers = require('./box-parsers')
const pp = require('./parsing-primitives')

module.exports = {
  ftyp: boxParsers.staticParser([
    {name: 'majorBrand', length: 4, reader: pp.readCharacters},
    {name: 'minorVersion', length: 4, reader: pp.readNumber},
    {name: 'compatibleBrands0', length: 4, reader: pp.readCharacters},
    {name: 'compatibleBrands1', length: 4, reader: pp.readCharacters},
    {name: 'compatibleBrands2', length: 4, reader: pp.readCharacters},
    {name: 'compatibleBrands3', length: 4, reader: pp.readCharacters},
  ]),
  mdia: boxParsers.containerBox,
  minf: boxParsers.containerBox,
  moov: boxParsers.containerBox,
  trak: boxParsers.containerBox,
}
