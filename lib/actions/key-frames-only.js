module.exports = function (context) {
  if (context.pictType) {
    Promise.resolve(Object.assign({}, context, {pictType: null}));
  } else {
    Promise.resolve(Object.assign({}, context, {pictType: 'I'}));
  }
};
module.exports.helpText = 'Only show video key frames';
