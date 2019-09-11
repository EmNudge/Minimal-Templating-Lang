const {
  between,
  sequenceOf,
  optionalWhitespace,
  letters,
} = require("arcsecond");
const { parserAndContent } = require('./utils');

const opener = sequenceOf([
  str('{{'),
  optionalWhitespace,
]);
const closer = sequenceOf([
  optionalWhitespace,
  str('}}'),
]);

const variableParser = between(opener)(closer)(letters);

module.exports = { partialParser }
