module.exports = function (context) {
  let {tracksToShow, frames, nextFrame, framesToShow, streams, pictType, ptsOverflow} = context;

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
  const lastFrameByStream = {};
  while (nextFrame < frames.length && toPrint.length < framesToShow) {
    let frame = frames[nextFrame];
    frame.__frame_index = nextFrame;
    nextFrame += 1;

    let keepFrame = true;
    if (!tracksToShow.includes(frame.stream_index)) {
      keepFrame = false;
    } else if (pictType && frame.pict_type !== pictType) {
      keepFrame = false;
    } else if (ptsOverflow) {
      const lastFrame = lastFrameByStream[frame.stream_index];
      keepFrame = false;
      if (lastFrame) {
        const ptsDiff = frame.pkt_pts - lastFrame.pkt_pts;
        if (Math.abs(ptsDiff - frame.pkt_duration) > ptsOverflow) {
          toPrint.push(lastFrame);
          keepFrame = true;
        }
      }
      lastFrameByStream[frame.stream_index] = frame;
    }

    if (keepFrame) {
        toPrint.push(frame);
    }
  }

  return {toPrint, context: Object.assign({}, context, {nextFrame})};
};
