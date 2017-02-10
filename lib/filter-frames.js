module.exports = function (context) {
  let {tracksToShow, frames, nextFrame, framesToShow, streams, pictType} = context;

  let hasVideo = tracksToShow.map(i => streams[i]).some(s => s.codec_type === 'video');
  if (!hasVideo && pictType) {
    const stream = streams[tracksToShow[0]];
    if (stream.codec_type !== 'video') {
      if (pictType === 'I') {
        pictType = 'key';
      }
      console.warn(`Cannot filter to ${pictType} frames with only audio streams`);
      return {toPrint: [], context};
    }
  }

  const toPrint = [];
  while (nextFrame < frames.length && toPrint.length < framesToShow) {
    let frame = frames[nextFrame];
    frame.__frame_index = nextFrame;
    nextFrame += 1;

    let keepFrame = true;
    if (!tracksToShow.includes(frame.stream_index)) {
      keepFrame = false;
    } else if (pictType && frame.pict_type !== pictType) {
      keepFrame = false;
    }

    if (keepFrame) {
      toPrint.push(frame);
    }
  }

  return {toPrint, context: Object.assign({}, context, {nextFrame})};
};
