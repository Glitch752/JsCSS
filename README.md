# JsCSS

A simple CSS preprocessor that lets you write code similar to JavaScript that is converted to plain CSS.

This postprocessor contains 2 modes: custom compilation, and regular javascript evaling.

## Custom compilation

You can use this mode by simply not supplying the --eval parameter.

### Example

JsCSS code:
```
h1 {
    font-size: 10rem;
    color: red; // This is a JS comment
    // This is a JS comment on a new line
    /* And this is a CSS comment */

    // This is a JS variable definition
    let coolThing = 5rem; let otherCoolThing = 6rem;

    let defaultColor = purple;

    // This is a CSS variable definition
    --CSScoolThing: 3rem;

    testFunction(orange);
}

function testFunction(colorName) {
    // This is a JS comment

    color: {colorName} !important;

    anotherFunction({colorName}, green);
}

function anotherFunction(anotherParameter, secondParameter) {
    // This is a JS comment
    margin: 3rem;

    background-color: var(--defaultColor, {anotherParameter});

    }
    h1::after {
        content: "";
        display: block;
        height: 100%;
        width: 100%;
        background-color: var({secondParameter}, orange);

    // Parameters are still modified if they are in comments: anotherParameter
}

// For loop
for(var loopIteration = -5; loopIteration < 5; loopIteration++) {
    if({loopIteration} % 3 === 0) {
        .element{loopIteration} {
            transform: translate(calc({loopIteration} * 10px), 0);
        }
    } else if ({loopIteration} % 5 === 0) {
        .element{loopIteration} {
            transform: translate(calc({loopIteration} * 10px), calc({loopIteration} * 10px));
        }
    } else {
        .element{loopIteration} {
            transform: translate(0, calc({loopIteration} * 10px));
        }
    }
}
```

After:
```
h1 {
    font-size: 10rem;
    color: red;
 /* This is a JS comment */
    /* This is a JS comment on a new line */
    /* And this is a CSS comment */
    /* This is a JS variable definition */
    --coolThing: 5rem;
    --otherCoolThing: 6rem;
    --defaultColor: purple;
    /* This is a CSS variable definition */
    --CSScoolThing: 3rem;
    /* This is a JS comment */
    color: orange !important;
    /* This is a JS comment */
    margin: 3rem;
    background-color: var(--defaultColor, orange);
}

h1::after {
    content: "";
    display: block;
    height: 100%;
    width: 100%;
    background-color: var(green, orange);
    /* Parameters are still modified if they are in comments: anotherParameter */;
}



/* For loop */
.element-5 {
    transform: translate(calc(-5 * 10px), calc(-5 * 10px));
}

.element-4 {
    transform: translate(0, calc(-4 * 10px));
}

.element-3 {
    transform: translate(calc(-3 * 10px), 0);
}

.element-2 {
    transform: translate(0, calc(-2 * 10px));
}

.element-1 {
    transform: translate(0, calc(-1 * 10px));
}

.element0 {
    transform: translate(calc(0 * 10px), 0);
}

.element1 {
    transform: translate(0, calc(1 * 10px));
}

.element2 {
    transform: translate(0, calc(2 * 10px));
}

.element3 {
    transform: translate(calc(3 * 10px), 0);
}

.element4 {
    transform: translate(0, calc(4 * 10px));
}

```

Mathematical statements work using [expr-eval](https://github.com/silentmatt/expr-eval), which allows for many advanced features.

## Regular javascript compilation

This mode works using vm, so although it evaluates the code, it doesn't have access to node.js modules.

### Example

JsCSS code:
```
[
    h1 {
        font-size: 10rem;
        color: red; 
        
        --CSScoolThing: 3rem;
]
    // This is a JS comment
    // This is a JS comment on a new line
    /* And this is a CSS comment */

    // This is a JS variable definition
    let coolThing = "5rem"; let otherCoolThing = "6rem";

    let defaultColor = "purple";
    testFunction("orange");
[
    }
]

function testFunction(colorName) {
    // This is a JS comment

    [color: ${colorName} !important;]

    anotherFunction(colorName, "green");
}

function anotherFunction(anotherParameter, secondParameter) {
    // This is a JS comment
    [
        margin: 3rem;

        background-color: var(--defaultColor, ${anotherParameter});

        }
        h1::after {
            content: "";
            display: block;
            height: 100%;
            width: 100%;
            background-color: var(${secondParameter}, orange);
    ]
    // Parameters are still modified if they are in comments: anotherParameter
}

// For loop
for(var loopIteration = -5; loopIteration < 5; loopIteration++) {
    if({loopIteration} % 3 === 0) {
        [
            .element${loopIteration} {
                transform: translate(calc(${loopIteration} * 10px), 0);
            }
        ]
    } else if ({loopIteration} % 5 === 0) {
        [
            .element${loopIteration} {
                transform: translate(calc(${loopIteration} * 10px), calc(${loopIteration} * 10px));
            }
        ]
    } else {
        [
            .element${loopIteration} {
                transform: translate(0, calc(${loopIteration} * 10px));
            }
        ]
    }
}
```

After:
```
h1 {
    font-size: 10rem;
    color: red;
    --CSScoolThing: 3rem;
    color: orange !important;
    margin: 3rem;
    background-color: var(--defaultColor, orange);
}

h1::after {
    content: "";
    display: block;
    height: 100%;
    width: 100%;
    background-color: var(green, orange);
}

.element-5 {
    transform: translate(0, calc(-5 * 10px));
}

.element-4 {
    transform: translate(0, calc(-4 * 10px));
}

.element-3 {
    transform: translate(0, calc(-3 * 10px));
}

.element-2 {
    transform: translate(0, calc(-2 * 10px));
}

.element-1 {
    transform: translate(0, calc(-1 * 10px));
}

.element0 {
    transform: translate(0, calc(0 * 10px));
}

.element1 {
    transform: translate(0, calc(1 * 10px));
}

.element2 {
    transform: translate(0, calc(2 * 10px));
}

.element3 {
    transform: translate(0, calc(3 * 10px));
}

.element4 {
    transform: translate(0, calc(4 * 10px));
}
```

### Contributing
If you would like to make JsCSS better, feel free to open an issue or submit a pull request!
