const actions = require('./index');

module.exports = function (context) {
  return new Promise((resolve, reject) => {
    let trackQuestion = '';

    context.tracksToShow.forEach(i => {
      const stream = context.streams.find(s => s.index === i);
      trackQuestion += '' + JSON.stringify(stream, null, '    ') + '\n\n';
    });

    trackQuestion += 'That\'s the metadata for the streams showing. Hit enter to return to frames.';

    actions.rl.question(trackQuestion, () => {
      resolve(context);
    });
  });
};

module.exports.helpText = 'Print detailed information about the streams';
