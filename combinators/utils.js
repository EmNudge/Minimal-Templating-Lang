const {
  everythingUntil,
  sequenceOf,
  many,
  endOfInput,
  coroutine,
} = require("arcsecond");

const sepBySeparator = parser => coroutine(function*() {
  const results = [];

  while(true) {
    const text = yield everythingUntil(parser);
    if (text.isError) break;
    results.push(text);
    results.push(yield parser);
  }

  return [...results, yield everythingUntil(endOfInput)]
})

// returns everything and instances of the parser. Like sepBy, but it returns the parser.
const contentRepeater = many(sequenceOf([
  everythingUntil(parser),
  parser,
])).map(x => x.flat());

const parserAndContent = parser => sequenceOf([
  contentRepeater,
  everythingUntil(endOfInput)
]).map(x => x.flat());

module.exports = { parserAndContent, sepBySeparator }
