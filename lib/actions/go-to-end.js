module.exports = function (context) {
  const startOfTheEnd = context.frames.length - context.framesToShow;
  return Promise.resolve(Object.assign({}, context, {nextFrame: startOfTheEnd}));
};
module.exports.helpText = 'Go back to the last batch of available frames';
