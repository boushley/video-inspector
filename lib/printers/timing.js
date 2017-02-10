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
    let frameMessage = '';
    if (tracksToShow.length > 1) {
      frameMessage = `Stream: Type <${frame.media_type}> Index <${frame.stream_index}> `;
    }

    frameMessage += `PTS: <${frame.pkt_pts}>[${frame.pkt_pts_time}] Duration: <${frame.pkt_duration}>[${frame.pkt_duration_time}] Pos: <${frame.pkt_pos}>`;

    if (frame.media_type === 'video') {
      frameMessage += ` Frame Type: <${frame.pict_type}>`;
    }

    console.log(frameMessage);
  });

  return Object.assign({}, context, {nextFrame});
};
module.exports.description = 'Print basic frame timing info';
