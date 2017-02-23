module.exports = function(context, toPrint) {
  let {tracksToShow} = context;

  if (toPrint.length === 0) {
    console.log('No frames matched our filters.');
  }

  toPrint.forEach(frame => {
    let frameMessage = '';
    if (tracksToShow.length > 1) {
      frameMessage += `Stream: Type <${frame.media_type}> Index <${frame.stream_index}> `;
    }

    frameMessage += `Frame: #${frame.__frame_index} PTS: <${frame.pkt_pts}>[${frame.pkt_pts_time}] Pos: <${frame.pkt_pos}> Duration: <${frame.pkt_duration}>[${frame.pkt_duration_time}]`;

    const lastFrame = findPreviousFrame(context.frames, frame.media_type, frame.__frame_index);
    if (lastFrame) {
      const ptsDiff = frame.pkt_pts - lastFrame.pkt_pts;
      frameMessage += ` PTS Diff: <${ptsDiff}>`;
    }

    if (frame.media_type === 'video') {
      frameMessage += ` Type: <${frame.pict_type}>`;
    }

    console.log(frameMessage);
  });
};

function findPreviousFrame(frames, type, index) {
  for (var i = index - 1; i >= 0; i--) {
    if (frames[i].media_type === type) {
      return frames[i];
    }
  }
}
module.exports.description = 'Print basic frame timing info';
