const {
  between,
  sequenceOf,
  optionalWhitespace,
  letters,
  str,
  possibly,
} = require("arcsecond");
const { sepBySeparator } = require('./utils')

const opener = sequenceOf([
  str('{{'),
  optionalWhitespace,
]);
const closer = sequenceOf([
  optionalWhitespace,
  str('}}'),
]);

// make it into an object to distinguish from regular captures.
const variableParser = sequenceOf([
  opener,
  possibly(letters),
  closer,
]).map(x => ({ name: x[1] ? x[1] : 'children' }));

const partialParser = sepBySeparator(variableParser)

module.exports = { partialParser }
