var actions = require('./index');

module.exports = function (context) {
  return new Promise((resolve) => {
    const explanation = `Here's some info on the fields we're presenting.

    Stream Fields
    Time Base - This is the fundamental unit of time (in seconds) in terms of which frame timestamps are represented. Examples: 1/12288 and 1/44100
    nb_frames - The number of frames in the stream

    Frame Fields
    PTS - Presentation timestamp in Time Base units; the time at which the decompressed packet will be presented to the user
    DTS - Decompression timestamp in Time Base units; the time at which the packet is decompressed.
    POS - byte position in stream, -1 if unknown. This is the position of the first byte of this packet within the stream.
    Duration - Duration of this packet in Time Base units, 0 if unknown. Equals next_pts - this_pts in presentation order.

    Hit enter to return to the frames
    `;

    actions.rl.question(explanation, () => {
      resolve(context);
    });
  });
};

module.exports.helpText = 'Print descriptions of many of the fields';
