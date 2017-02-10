module.exports.help = require('./show-help');
module.exports.size = require('./choose-results-size');
module.exports.tracks = require('./choose-tracks');
module.exports.gg = require('./go-to-start');
module.exports.G = require('./go-to-end');
module.exports.q = require('./quit');
module.exports.noOp = function (context) { return Promise.resolve(context); };
