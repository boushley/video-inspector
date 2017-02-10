var actions = require('./index');

module.exports = function (context) {
  return new Promise((resolve) => {
    let helpText = '';
    Object.keys(actions).forEach(key => {
      const command = actions[key];
      if (command && command.helpText) {
        helpText += `[${key}] ${command.helpText}\n`;
      }
    });

    actions.rl.question(helpText, () => {
      resolve(context);
    });
  });
};

module.exports.helpText = 'Print this help menu';
