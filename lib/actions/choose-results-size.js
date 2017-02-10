const actions = require('./index');

const DEFAULT_TO_SHOW = 20;
module.exports = function (context) {
  return new Promise((resolve, reject) => {
    actions.rl.question(`Alright, lets look at some of those PTS values. How many at a time? [${DEFAULT_TO_SHOW}]`, (answer) => {
      let framesToShow = parseInt(answer) || DEFAULT_TO_SHOW;
      resolve(Object.assign({}, context, {framesToShow}));
    });
  });
};

module.exports.helpText = 'Choose the number of frames per screen';
