const actions = require('./index');
const printers = require('../printers');

module.exports = function (context) {
  return new Promise((resolve) => {
    let printersPrompt = '';
    Object.keys(printers).forEach(key => {
      const printer = printers[key];
      if (printer && printer.description) {
        printersPrompt += `[${key}] ${printer.description}\n`;
      }
    });

    actions.rl.question(printersPrompt, (answer) => {
      answer = answer.trim();

      let result = Object.assign({}, context);

      let newPrinter = printers[answer];
      if (newPrinter) {
        result.printer = newPrinter;
        if (newPrinter.defaultFramesToShow) {
          result.framesToShow = newPrinter.defaultFramesToShow;
        }
      }

      resolve(result);
    });
  });
};

module.exports.helpText = 'Choose the data output for frames';
