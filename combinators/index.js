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

const { sepBySeparator } = require('./utils')

const inTags = between(openingTag)(closingTag);

const withSelfClosingTags = sepBySeparator(selfClosingTag)

module.exports = { withSelfClosingTags, inTags }
