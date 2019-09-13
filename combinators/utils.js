const {
  everythingUntil,
  char,
  endOfInput,
  coroutine,
  lookAhead,
  either,
} = require("arcsecond");

// like sepBy, but it also returns the separator and the value parser is everything.
const sepBySeparator = parser => coroutine(function*() {
  const results = [];

  let restOfInput;

  while(true) {
    restOfInput = yield lookAhead(everythingUntil(endOfInput));

    // must use either() so parser doesn't terminate
    const nextInstance = yield either(lookAhead(everythingUntil(parser)));
    if (nextInstance.isError) break;

    results.push(yield everythingUntil(parser));
    results.push(yield parser);
  }
  
  return restOfInput ? [...results, restOfInput] : results;
})

module.exports = { sepBySeparator }
