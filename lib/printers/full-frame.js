module.exports = function(context) {
  let {tracksToShow, frames, nextFrame, framesToShow} = context;
  let collected = [];

  while (nextFrame < frames.length && collected.length < framesToShow) {
    let frame = frames[nextFrame];
    nextFrame += 1;
    if (tracksToShow.includes(frame.stream_index)) {
      collected.push(frame);
    }
  }

  collected.forEach(frame => {
    console.log(JSON.stringify(frame, null, '    '));
  });

  return Object.assign({}, context, {nextFrame});
};
module.exports.description = 'Print out the full contents of frames';
module.exports.defaultFramesToShow = 1;
