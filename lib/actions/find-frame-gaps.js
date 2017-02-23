const actions = require('./index');

module.exports = function (context) {
  return new Promise((resolve, reject) => {
    let question;
    let result;
    if (context.ptsOverflow) {
      question = 'The PTS gap filter will be removed.';
      result = Object.assign({}, context, {ptsOverflow: null});
    } else {
      question = 'Alright, we\'ll now show you frames with a PTS gap greater than the duration.';
      result = Object.assign({}, context, {ptsOverflow: 5});
    }
    actions.rl.question(question, () => {
      resolve(result);
    });
  });
};

module.exports.helpText = 'Only show frames with PTS gaps';
