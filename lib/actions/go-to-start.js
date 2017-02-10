module.exports = function (context) {
  return Promise.resolve(Object.assign({}, context, {nextFrame: 0}));
};
module.exports.helpText = 'Go back to the first frame';
