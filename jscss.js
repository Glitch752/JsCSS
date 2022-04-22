const fs = require('fs');
const path = require('path');

const Parser = require('expr-eval').Parser;
const parser = new Parser({
    operators: {
        add: true,
        concatenate: true,
        conditional: true,
        divide: true,
        factorial: true,
        multiply: true,
        power: true,
        remainder: true,
        subtract: true,

        logical: true,
        comparison: true,

        'in': false,
        assignment: false
    }
});

const cssBeautify = require('cssbeautify');

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m"
    }
};

const args = process.argv.slice(2);

function printUsage() {
    console.log("Usage: node jscss.js <filename> [options]");
    console.log("Options:");
    console.log("  --eval: use regular javascript instead of custom compiler     NOTE: requires different syntax, but allows for ALL javascript features");
}

if(args.length < 1) {
    printUsage();
    process.exit(1);
}

let useEval = false;

let filePath = null;

for(var i = 0; i < args.length; i++) {
    if(args[i] == "--eval") {
        useEval = true;
    } else {
        filePath = args[i];
    }
}

if(!filePath) {
    printUsage();
    process.exit(1);
}

const maxFunctionCallDepth = 20;

try{
    if(fs.existsSync(filePath)) {
        let fileContents = fs.readFileSync(filePath, 'utf8');
        fileContents = fileContents.replace('\r\n', '\n');
        
        let lines = fileContents.split('\n');

        if(useEval) {
            const vm = require('vm');
            const util = require('util');
            
            let script = fileContents;

            ({ script } = parseEval(script));

            console.log(script);
            
            lines = [];
            
            const cons = {
              log: (...args) => lines.push((util.format(...args))),
            };
            const context = vm.createContext({console: cons});
            
            try {
                vm.runInContext(script, context);
            } catch(err) {
                errorMessage("Eval error: " + err);
                console.log(err);
                process.exit(1);
            }
        } else {
            ({ lines } = parseLoops(lines));

            lines = fixLines(lines);

            // Parse the comments and variables
            for(var i = 0; i < lines.length; i++) {
                let line = lines[i];
                for(var j = 0; j < line.length; j++) {
                    const lineSplit = line.substring(j);
                    // Change JS comments to CSS comments
                    if(lineSplit.startsWith('//')) {
                        lines[i] = line.substring(0, j) + "/* " + line.substring(j + 2).trim() + " */";
                        break;
                    }

                    // Change JS variable definitions to CSS variable definitions
                    if(lineSplit.startsWith('var ') || lineSplit.startsWith('const ') || lineSplit.startsWith('let ')) {
                        lines[i] = line.substring(0, j) + "--" + line.substring(j).split(" ")[1].split("=")[0].trim() + ": " + line.substring(j).split("=").slice(1).join("=").trim();
                        line = lines[i];
                    }
                }
            }

            ({ lines } = fixElseIf(lines));

            lines = fixLines(lines);

            // Parse the conditional statements
            ({ lines } = parseConditionals(lines));

            lines = fixLines(lines);

            // Parse the functions
            ({ functions, lines } = parseFunctions(lines));

            lines = fixLines(lines);

            // Replace the function calls with the function contents
            ({ lines } = replaceFunctions(lines, functions));

            lines = fixLines(lines);
        }

        fileContents = lines.join("\n");

        // Format the CSS
        fileContents = cssBeautify(fileContents, {
            indent: '    ',
            openbrace: 'end-of-line',
            autosemicolon: true
        });

        console.log("Sucessfully compiled JsCSS code to CSS!");

        fs.writeFileSync(path.join(path.parse(filePath).dir, path.parse(filePath).name + ".css"), fileContents);
    } else {
        console.log("File does not exist");
        process.exit(1);
    }
} catch(e) {
    console.log(e);
    process.exit(1);
}

function parseFunctions(lines) {
    let functions = [];
    let tryAgain = true;

    while(tryAgain) {
        tryAgain = false;
        for(var i = 0; i < lines.length; i++) {
            let line = lines[i];
            if(line === null) continue;
            for(var j = 0; j < line.length; j++) {
                const lineSplit = line.substring(j);
                // If we find a function definition, add it to functions and loop through the lines again.
                if(lineSplit.startsWith('function ')) {
                    const functionName = line.substring(j + 9).split("(")[0].trim();
                    let functionArgs = line.substring(j + 9).split("(")[1].split(")").slice(0, 1)[0].split(",").map(arg => arg.trim());
                    functionArgs = functionArgs.filter(arg => arg !== "");
                    
                    // Find the contents of the function
                    lines[i] = null;
                    
                    let functionContents = "";
                    let functionEnd = false;
                    for(var k = i + 1; k < lines.length; k++) {
                        if(lines[k].startsWith('}')) {
                            functionEnd = true;
                            lines[k] = null;
                            break;
                        }
                        functionContents += lines[k].trim() + "\n";
                        lines[k] = null;
                    }
                    if(!functionEnd) {
                        errorMessage("Function " + functionName + " is not closed");
                        process.exit(1);
                    }
                    functions.push(
                        {
                            name: functionName,
                            contents: functionContents,
                            args: functionArgs
                        }
                    );
                    tryAgain = true;
                    break;
                }
            }
        }
    }

    return { functions, lines };
}

function fixLines(lines) {
    let oldLines = lines;
    lines = [];

    for(var i = 0; i < oldLines.length; i++) {
        if(oldLines[i] != null) {
            lines.push(oldLines[i]);
        }
    }

    return lines;
}

function errorMessage(message) {
    console.log(colors.bright, colors.fg.red, "ERROR: ", colors.reset, colors.fg.red, message, colors.reset);
}

function replaceFunctions(lines, functions) {
    let tryAgain = true;
    let functionCallDepth = 0;
    while(tryAgain) {
        tryAgain = false;
        for(var i = 0; i < lines.length; i++) {
            let line = lines[i];
            for(var j = 0; j < line.length; j++) {
                const lineSplit = line.substring(j);
                for(var k = 0; k < functions.length; k++) {
                    const functionName = functions[k].name;
                    const functionContents = functions[k].contents;
                    if(lineSplit.startsWith(functionName + '(')) {
                        let foundFunction = false;
                        const functionArgsString = line.substring(j + functionName.length + 1).split(")")[0].trim();
                        const functionArgs = functionArgsString.split(",").map(arg => arg.trim());
                        if(functionArgs === undefined) functionArgs = [];
                        const splitContents = functionContents.split("\n");
                        for(var l = 0; l < splitContents.length; l++) {
                            lines.splice(i + l, 0, lines[i].substring(0, j) + splitContents[l]);
                            let checkForFunctionLine = lines[i + l];
                            for(var m = 0; m < checkForFunctionLine.length; m++) {
                                const checkForFunctionLineSplit = checkForFunctionLine.substring(m);
                                for(var n = 0; n < functions.length; n++) {
                                    const checkForFunctionName = functions[n].name;
                                    if(checkForFunctionLineSplit.startsWith(checkForFunctionName + '(')) {
                                        foundFunction = true;
                                        break;
                                    }
                                }
                            }
                            let checkForArgsLine = lines[i + l];
                            for(var m = 0; m < checkForArgsLine.length; m++) {
                                const checkForArgsLineSplit = checkForArgsLine.substring(m);
                                // Make sure we're not inside a comment

                                for(var n = 0; n < functions[k].args.length; n++) {
                                    const checkForFunctionArg = functions[k].args[n];
                                    if(checkForArgsLineSplit.startsWith("{" + checkForFunctionArg + "}")) {
                                        lines[i + l] = lines[i + l].substring(0, m) + functionArgs[n] + checkForArgsLineSplit.substring(checkForFunctionArg.length + 2);
                                    }
                                }
                            }
                        }
                        lines.splice(i + l, 1);
                        line = lines[i];
                        tryAgain = true;
                        if(foundFunction) {
                            functionCallDepth++;
                            if(functionCallDepth > maxFunctionCallDepth) {
                                errorMessage("Maximum function call depth exceeded");
                                process.exit(1);
                            }
                        } else {
                            functionCallDepth = 0;
                        }
                    }
                }
            }
        }
    }

    return { lines };
}

function parseLoops(lines) {
    let tryAgain = true;
    while(tryAgain) {
        tryAgain = false;
        for(var i = 0; i < lines.length; i++) {
            let line = lines[i];
            if(line === null) continue;
            for(var j = 0; j < line.length; j++) {
                const lineSplit = line.substring(j);
                if(lineSplit.startsWith('for(')) {
                    let forContents = [];
                    let forEnd = false;
                    let forArgs = line.substring(j + 4).split(")").slice(0, 1)[0].split(" ").map(arg => arg.trim());
                    if(forArgs.length < 8 || forArgs.length > 9) {
                        errorMessage("Invalid for loop syntax. Usage: for(var i = __; i < __; i++) { ... }");
                        process.exit(1);
                    }
                    if(
                        (forArgs[0] !== "var" && forArgs[0] !== "let") ||
                        forArgs[2] !== "=" ||
                        (forArgs[5] !== "<" && forArgs[5] !== ">" && forArgs[5] !== "<=" && forArgs[5] !== ">=")) {
                        errorMessage("Invalid for loop syntax. Usage: for(var i = __; i < __; i++) { ... }");
                        process.exit(1);
                    }
                    if(
                        !(forArgs[1] === forArgs[4] && forArgs[1] === forArgs[7].substring(0, forArgs[7].length - 2))
                    ) {
                        errorMessage("Invalid for loop syntax. Usage: for(var i = __; i < __; i++) { ... }");
                        process.exit(1);
                    }
                    let openBracketCount = 1;
                    for(var k = i + 1; k < lines.length; k++) {
                        if(lines[k] === null) continue;
                        for(var l = 0; l < lines[k].length; l++) {
                            const lineSplit = lines[k].substring(l);
                            if(lineSplit.startsWith('{')) {
                                openBracketCount++;
                            }
                            if(lineSplit.startsWith('}')) {
                                openBracketCount--;

                                if(openBracketCount === 0) {
                                    forEnd = true;
                                    break;
                                }
                            }
                        }
                        if(forEnd) break;
                        forContents.push(lines[k]);
                        lines[k] = null;
                    }

                    lines = fixLines(lines);

                    lines[i] = null;
                    lines[i + 1] = null;

                    if(!forEnd) {
                        errorMessage("For loop is not closed");
                        process.exit(1);
                    }
                    let loopIterator = parseInt(forArgs[3]);
                    let loopIterationVar = forArgs[1];

                    let loopEnd = parseInt(forArgs[6]);
                    let loopComparison = forArgs[5];

                    let realLoopIndex = 0;
    
                    if(loopComparison === "<") {
                        for(var k = loopIterator; k < loopEnd; k++) {
                            ({ lines } = parseLoopContents(i, lines, forContents, loopIterationVar, k, realLoopIndex));
                            realLoopIndex++;
                        }
                    } else if(loopComparison === ">") {
                        for(var k = loopIterator; k > loopEnd; k--) {
                            ({ lines } = parseLoopContents(i, lines, forContents, loopIterationVar, k, realLoopIndex));
                            realLoopIndex++;
                        }
                    } else if(loopComparison === "<=") {
                        for(var k = loopIterator; k <= loopEnd; k++) {
                            ({ lines } = parseLoopContents(i, lines, forContents, loopIterationVar, k, realLoopIndex));
                            realLoopIndex++;
                        }
                    } else if(loopComparison === ">=") {
                        for(var k = loopIterator; k >= loopEnd; k--) {
                            ({ lines } = parseLoopContents(i, lines, forContents, loopIterationVar, k, realLoopIndex));
                            realLoopIndex++;
                        }
                    }

                    tryAgain = true;
                    break;
                }
            }
        }
    }

    return { lines };
}

function parseLoopContents(forLine, lines, contents, loopIterationVar, loopIteration, realLoopIteration) {
    let lineOffset = realLoopIteration * (contents.length);

    for(var i = 0; i < contents.length; i++) {
        let line = contents[i];
        if(line === null) continue;
        for(var j = 0; j < line.length; j++) {
            const lineSplit = line.substring(j);
            if(lineSplit.startsWith("{" + loopIterationVar + "}")) {
                line = line.substring(0, j) + loopIteration + lineSplit.substring(loopIterationVar.length + 2);
            }
        }

        lines.splice(forLine + lineOffset + i, 0, line);
    }

    return { lines };
}

function parseConditionals(lines) {
    let tryAgain = true;
    while(tryAgain) {
        tryAgain = false;
        for(var i = 0; i < lines.length; i++) {
            let line = lines[i]?.replace(/\s/g, '');
            if(line == null) continue;
            for(var j = 0; j < line.length; j++) {
                const lineSplit = line.substring(j);
                if(lineSplit.startsWith('if(')) {
                    let ifContents = [];
                    let elseContents = [];

                    let isElse = false;
                    let ifEnd = false;
                    let ifArgs = line.substring(j + 3).split(")").slice(0, 1)[0].trim();

                    let openBracketCount = 1;
                    for(var k = i + 1; k < lines.length; k++) {
                        if(lines[k] === null) continue;
                        for(var l = 0; l < lines[k].length; l++) {
                            const lineSplit = lines[k].substring(l);
                            if(lineSplit.startsWith('{')) {
                                openBracketCount++;
                            }
                            if(lineSplit.startsWith('}')) {
                                openBracketCount--;

                                if(openBracketCount === 0) {
                                    ifEnd = true;
                                    if(lineSplit.replace(/\s+/g, '').startsWith('}else')) {
                                        isElse = true;
                                        let elseEnd = false;
                                        openBracketCount = 1;
                                        for(var m = k + 1; m < lines.length; m++) {
                                            if(lines[m] === null) continue;
                                            for(var n = 0; n < lines[m].length; n++) {
                                                const lineSplit = lines[m].substring(n);
                                                if(lineSplit.startsWith('{')) {
                                                    openBracketCount++;
                                                }
                                                if(lineSplit.startsWith('}')) {
                                                    openBracketCount--;

                                                    if(openBracketCount === 0) {
                                                        elseEnd = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if(elseEnd) break;
                                            elseContents.push(lines[m]);
                                            lines[m] = null;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        if(ifEnd) break;
                        ifContents.push(lines[k]);
                        lines[k] = null;
                    }

                    lines[i] = null;
                    lines[k] = null;

                    if(isElse) {
                        lines[m] = null;
                    }

                    if(!ifEnd) {
                        errorMessage("If statement is not closed");
                        process.exit(1);
                    }

                    ifArgs = ifArgs.replace(/===/g, "==");
                    
                    let ifResult = null;
                    try{
                        ifResult = parser.evaluate(ifArgs);
                    } catch(e) {
                        errorMessage("Error in if statement - " + e.message);
                        process.exit(1);
                    }
                    if(typeof ifResult !== "boolean") {
                        errorMessage("Invalid if statement syntax. Result must be a boolean.");
                        process.exit(1);
                    }

                    if(ifResult) {
                        for(var k = 0; k < ifContents.length; k++) {
                            lines.splice(i + k, 0, ifContents[k]);
                        }
                        tryAgain = true;
                    } else if(isElse) {
                        for(var k = 0; k < elseContents.length; k++) {
                            lines.splice(i + k, 0, elseContents[k]);
                        }
                        tryAgain = true;
                    }
                }
            }
        }
    }

    return { lines };
}

// Turn } else if( ... ) { ... } into } else { if( ... ) { ... }}
function fixElseIf(lines) {
    let tryAgain = true;
    while(tryAgain) {
        tryAgain = false;
        let openIfElses = 0;
        for(var i = 0; i < lines.length; i++) {
            let line = lines[i].replace(/\s+/g, '');
            if(line == null) continue;
            for(var j = 0; j < line.length; j++) {
                const lineSplit = line.substring(j);
                if(lineSplit.startsWith('}elseif(')) {
                    // Change the elseif to an else with the rest of the statement inside of it
                    lines[i] = lines[i].substring(0, j) + "} else {";
                    i++;
                    lines.splice(i, 0, "if(" + lineSplit.split("(")[1].split(")")[0].trim() + ") {");
                    openIfElses++;
                }
                if(lineSplit.startsWith('}else{')) {
                    // Find the end of the else statement
                    if(openIfElses === 0) break;
                    let openBracketCount = 1;
                    for(var k = i + 1; k < lines.length; k++) {
                        if(lines[k] === null) continue;
                        for(var l = 0; l < lines[k].length; l++) {
                            const lineSplit = lines[k].substring(l);
                            if(lineSplit.startsWith('{')) {
                                openBracketCount++;
                            }
                            if(lineSplit.startsWith('}')) {
                                openBracketCount--;

                                if(openBracketCount === 0) {
                                    for(var m = 0; m < openIfElses; m++) {
                                        lines.splice(k + m, 0, "}");
                                    }
                                    openIfElses = 0;
                                    tryAgain = true;
                                    break;
                                }
                            }
                        }
                        if(openBracketCount === 0) break;
                    }
                }
            }
        }
    }

    return { lines };
}

function parseEval(code) {
    // Replace all code inside of [ ... ] with console.log( ... );
    for(var i = 0; i < code.length; i++) {
        let letter = code[i];
        if(letter === "[") {
            let openBracketCount = 1;
            for(var j = i + 1; j < code.length; j++) {
                if(code[j] === "[") openBracketCount++;
                if(code[j] === "]") openBracketCount--;
                if(openBracketCount === 0) break;
            }
            let logCode = code.substring(i + 1, j);

            code = code.substring(0, i) + "console.log(`" + logCode + "`);" + code.substring(j + 1);
            i += "console.log(`".length + j - i;
        }
    }

    return { script: code };
}