const {
    str,
    everythingUntil
} = require("arcsecond");
const { partialParser } = require('./partials')
const { sepBySeparator } = require('./utils')

module.exports = () => {
    const myString = `
        hello my good friend it is a fine {{hello}}
        to be here on hello this great day you know {{}}
        woowee
    `
    const res1 = partialParser.run(myString);

    const res2 = sepBySeparator(str('hello')).run(myString)
}