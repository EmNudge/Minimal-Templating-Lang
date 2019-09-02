const fs = require("fs");
const path = require("path");

// getting all partial html files to store in a Map
const partialsDIR = path.join(process.cwd(), "/src/partials/");

const partials = new Map(fs.readdirSync(partialsDIR).map(file => {
    const fullPath = path.join(partialsDIR, file);
    const contents = fs.readFileSync(fullPath, "utf-8");
    const name = file.split('.')[0].toUpperCase();

    // returning an array since Map will interpret this as [key, value]
    return [
        name,
        contents,
    ]
}));

// replaces <TAGNAME/> with matching partial name from src/partials
function getPageWithPartials(contents) {
    const matchSCPartial = /<\s*[A-Z]+?\s*\/>/g;

    return contents.replace(matchSCPartial, tag => {
        const name = tag.match(/([A-Z])\w+/)[0];

        return partials.has(name) ? partials.get(name) : tag;
    });
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

    const pagePath = outputDIR + page;

    let pageWithPartials = getPageWithPartials(contents);

    // keep getting partials from the page until there are none left (where the page remains unchanged)
    for (;;) {
        const newPage = getPageWithRegPartials(pageWithPartials);
        if (newPage === pageWithPartials) break;
        pageWithPartials = newPage;
    }

    fs.writeFileSync(pagePath, pageWithPartials);
}