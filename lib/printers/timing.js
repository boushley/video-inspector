module.exports = function(context, toPrint) {
  let {tracksToShow} = context;
  let lastFrameByType = {};

  if (toPrint.length === 0) {
    console.log('No frames matched our filters.');
  }

  toPrint.forEach(frame => {
    let frameMessage = '';
    if (tracksToShow.length > 1) {
      frameMessage += `Stream: Type <${frame.media_type}> Index <${frame.stream_index}> `;
    }

    frameMessage += `Frame: #${frame.__frame_index} PTS: <${frame.pkt_pts}>[${frame.pkt_pts_time}] Pos: <${frame.pkt_pos}> Duration: <${frame.pkt_duration}>[${frame.pkt_duration_time}]`;

    const lastFrame = lastFrameByType[frame.media_type];
    if (lastFrame) {
      const ptsDiff = frame.pkt_pts - lastFrame.pkt_pts;
      frameMessage += ` PTS Diff: <${ptsDiff}>`;
    }

    if (frame.media_type === 'video') {
      frameMessage += ` Type: <${frame.pict_type}>`;
    }

    console.log(frameMessage);

    lastFrameByType[frame.media_type] = frame;
  });
};
module.exports.description = 'Print basic frame timing info';
