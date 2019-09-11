const {
  between,
  coroutine,
  letters,
  char,
  optionalWhitespace,
  regex,
  sequenceOf,
  possibly,
  many1,
  many,
  anythingExcept
} = require("arcsecond");

const matchCaps = many1(regex(/^[A-Z]/)).map(x => x.join(""));

const inQuotes = between(char('"'))(char('"'));
const any = many(anythingExcept(char('"'))).map(s => s.join(""));
const quoteData = inQuotes(any);

const property = coroutine(function*() {
  const name = yield letters;
  yield char("=");

  const value = yield quoteData;

  return { name, value };
});

const properties = many(sequenceOf([char(" "), property]).map(x => x[1]));

const opener = sequenceOf([char("<"), optionalWhitespace]);
const closer = sequenceOf([optionalWhitespace, char(">")]);
const tag = between(opener)(closer);

const tagData = coroutine(function*() {
  const name = yield matchCaps;
  const props = yield possibly(properties) || [];

  return { name, props };
});

const selfClosing = coroutine(function*() {
  const { name, props } = yield tagData;

  yield optionalWhitespace;
  yield char("/");

  return { name, props };
});

const opening = coroutine(function*() {
  const { name, props } = yield tagData;

  yield optionalWhitespace;

  return { name, props };
});

const closing = coroutine(function*() {
  yield char("/");

  const { name, props } = yield tagData;

  yield optionalWhitespace;

  return { name, props };
});

const selfClosingTag = tag(selfClosing);
const openingTag = tag(opening);
const closingTag = tag(closing);

module.exports = { selfClosingTag, openingTag, closingTag };
