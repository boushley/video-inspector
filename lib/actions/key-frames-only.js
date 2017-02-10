module.exports = function (context) {
  return Promise.resolve(Object.assign({}, context, {pictType: 'I'}));
};
module.exports.helpText = 'Only show video key frames';
