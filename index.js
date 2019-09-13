const fs = require("fs");
const path = require("path");
const { withSelfClosingTags } = require('./combinators/index')
const { partialParser } = require('./combinators/partials')

const test = require('./combinators/test');
test();

// getting all partial html files to store in a Map
const partialsDIR = path.join(process.cwd(), "/src/partials/");

const partials = new Map(fs.readdirSync(partialsDIR).map(file => {
    const fullPath = path.join(partialsDIR, file);
    const contents = fs.readFileSync(fullPath, "utf-8");
    const partialParsed = partialParser.run(contents).result;

    const name = file.split('.')[0].toUpperCase();
    // returning an array since Map will interpret this as [key, value]
    return [
        name,
        partialParsed,
    ]
}));

function pageWithSelfClosingPartials(contents) {
    const pageArr = withSelfClosingTags.run(contents).result;
    return pageArr.map(data => {
        if (typeof data === "string") return data;
        if (!partials.has(data.name)) return `<NO TAG OF NAME ${data.name} />`;

        const partial = partials.get(data.name);

        return partial.map(data1 => {
            if (typeof data1 === "string") return data1;

            const filler = data.props.find(prop => prop.name === data1.name);
            if (!filler) return `{{ NO PROP OF NAME ${data1.name} }}`;

            return filler.value;
        }).join('');
    }).join('');
}

// gets the index and matched string from a regex
function getAllMatches(contents, regex) {
    const matches = function*() {
        let match;
        while(match = regex.exec(contents)) {
            const {0: name, index} = match;
            yield {name, index};
        }
    };

    return [...matches()]
}

function getPageWithRegPartials(contents) {
    const openTags = getAllMatches(contents, /<\s*[A-Z]+?\s*>/g);
    const openingTag = openTags[openTags.length - 1];

    if (!openingTag) return contents;

    const tagName = openingTag.name.match(/([A-Z])\w+/)[0];
    if (!partials.has(tagName)) return contents;

    const {name, index} = openingTag;
    
    const closeTags = getAllMatches(contents, /<\/\s*[A-Z]+?\s*>/g);
    const closingTag = closeTags.filter(tag => tag.index > index || tag.name !== name)[0];

    if (!closingTag) throw new Error(`Opening tag ${name} found with no closing tag`);

    const beginText = contents.slice(0, index);
    const innerText = contents.slice(index + name.length, closingTag.index).trim();
    const endText = contents.slice(closingTag.index + closingTag.name.length);

    const partial = partials.get(name.match(/([A-Z])\w+/)[0]);
    const newText = partial.replace(/{{}}/g, innerText);

    return beginText + newText + endText;
}

const pagesDIR = path.join(process.cwd(), "/src/pages/");

const outputDIR = path.join(process.cwd(), '/dist/');
if (!fs.existsSync(outputDIR)) fs.mkdirSync(outputDIR);

// add fixed html to dist/
for (const page of fs.readdirSync(pagesDIR)) {
    const fullPath = path.join(pagesDIR, page);
    const contents = fs.readFileSync(fullPath, "utf-8");

    pageWithSelfClosingPartials(contents);
    

    const pagePath = outputDIR + page;

    let pageWithPartials = pageWithSelfClosingPartials(contents);

    // keep getting partials from the page until there are none left (where the page remains unchanged)
    for (;;) {
        const newPage = getPageWithRegPartials(pageWithPartials);
        if (newPage === pageWithPartials) break;
        pageWithPartials = newPage;
    }

    fs.writeFileSync(pagePath, pageWithPartials);
}