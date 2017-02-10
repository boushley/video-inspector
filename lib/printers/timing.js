module.exports = function(context, toPrint) {
  let {tracksToShow} = context;

  toPrint.forEach(frame => {
    let frameMessage = '';
    if (tracksToShow.length > 1) {
      frameMessage += `Stream: Type <${frame.media_type}> Index <${frame.stream_index}> `;
    }

    frameMessage += `Frame: #${frame.__frame_index} PTS: <${frame.pkt_pts}>[${frame.pkt_pts_time}] Pos: <${frame.pkt_pos}> Duration: <${frame.pkt_duration}>[${frame.pkt_duration_time}]`;

    if (frame.media_type === 'video') {
      frameMessage += ` Type: <${frame.pict_type}>`;
    }

    console.log(frameMessage);
  });
};
module.exports.description = 'Print basic frame timing info';
