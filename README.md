# JsCSS

A simple CSS preprocessor that lets you write code similar to JavaScript that is converted to plain CSS.

## Example

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
for(var loopIteration = -10; loopIteration < 10; loopIteration++) {
    if({loopIteration} % 3 === 0) {
        .element{loopIteration} {
            transform: translate(calc({loopIteration} * 10px), 0);
        }
    }
}
```

After:
```h1 {
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
.element-9 {
    transform: translate(calc(-9 * 10px), 0);
}

.element-6 {
    transform: translate(calc(-6 * 10px), 0);
}

.element-3 {
    transform: translate(calc(-3 * 10px), 0);
}

.element0 {
    transform: translate(calc(0 * 10px), 0);
}

.element3 {
    transform: translate(calc(3 * 10px), 0);
}

.element6 {
    transform: translate(calc(6 * 10px), 0);
}

.element9 {
    transform: translate(calc(9 * 10px), 0);
}

```

Mathematical statements work using [expr-eval](https://github.com/silentmatt/expr-eval), which allows for many advanced features