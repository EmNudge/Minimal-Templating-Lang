const {
  everythingUntil,
  between,
  sequenceOf,
  many,
  endOfInput
} = require("arcsecond");

const {
  selfClosingTag, openingTag, closingTag
} = require("./tags");

const inTags = between(openingTag)(closingTag);

// get all instances of anything and a self closing tag
const contentAndTags = many(sequenceOf([
  everythingUntil(selfClosingTag),
  selfClosingTag,
])).map(x => x.flat());

// get the final content after the last tag
const withTags = sequenceOf([
  contentAndTags,
  everythingUntil(endOfInput)
]).map(x => x.flat());

module.exports = { withTags, inTags }
