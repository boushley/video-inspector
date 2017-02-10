const actions = require('./index');

module.exports = function (context) {
  console.warn('Selecting tracks');
  return new Promise((resolve, reject) => {
    console.warn('Selecting In Promise');
    let trackQuestion = 'Which track do you want to see info about?';

    let index = 0;
    context.streams.forEach(s => {
      trackQuestion += `\n\t[${index}] ${s.codec_type} - ${s.codec_name} - ${s.bit_rate}`;
      if (s.codec_type === 'video') {
        trackQuestion += ` (${s.width}x${s.height})`;
      } else if (s.code_type === 'audio') {
        trackQuestion += ` (${s.channel_layout})`;
      }
      index++;
    });

    trackQuestion += `\n\t[${index}] All (default)\n`;

    actions.rl.question(trackQuestion, (answer) => {
      const result = Object.assign({}, context);
      if (!answer.trim() || answer === index) {
        console.log('Sounds good, we\'ll look at all the data');
        result.tracksToShow = context.streams.map(s => s.index);
      } else {
        console.log(`Great, lets get some info on track: ${answer}`);
        result.tracksToShow = [context.streams[parseInt(answer)].index];
      }
      resolve(result);
    });
  });
};

module.exports.helpText = 'Choose the track to show data from';
