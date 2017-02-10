const {exit} = require('../../lib/util');
module.exports = function () {
  exit(0, 'Hope that was helpful!');
  return new Promise(() => {});
};
module.exports.helpText = 'Quit';
