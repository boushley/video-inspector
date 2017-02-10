module.exports = function (context, args) {
  let nextFrame = parseInt(args[0]);
  if (!nextFrame && nextFrame !== 0) {
    nextFrame = context.nextFrame;
  }
  return Promise.resolve(Object.assign({}, context, {nextFrame}));
};
module.exports.helpText = 'Go back to a specific frame: `n 1000` goes to the 1000th frame and finds the next frame that meets your filter criteria';
