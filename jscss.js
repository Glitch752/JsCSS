const fs = require('fs');
const path = require('path');

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

if(args.length < 1) {
    console.log("Usage: node jscss.js <filename>");
    process.exit(1);
}

const filePath = args[0];

const maxFunctionCallDepth = 20;


try{
    if(fs.existsSync(filePath)) {
        let fileContents = fs.readFileSync(filePath, 'utf8');
        fileContents = fileContents.replace('\r\n', '\n');
        
        let lines = fileContents.split('\n');

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

        // Parse the functions
        ({ functions, lines } = parseFunctions(lines));

        lines = fixLines(lines);

        // Replace the function calls with the function contents
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

        lines = fixLines(lines);

        fileContents = lines.join("\n");

        console.log("Sucessfully compiled JsCSS code to CSS!")

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
                            contents: functionContents 
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
        if(oldLines[i] !== null) {
            lines.push(oldLines[i]);
        }
    }

    return lines;
}

function errorMessage(message) {
    console.log(colors.bright, colors.fg.red, "ERROR: ", colors.reset, colors.fg.red, message, colors.reset);
}