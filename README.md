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
    } else {
        .element{loopIteration} {
            transform: translate(calc({loopIteration} * 10px), calc({loopIteration} * 10px));
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
.element-10 {
    transform: translate(calc(-10 * 10px), calc(-10 * 10px));
}

.element-9 {
    transform: translate(calc(-9 * 10px), 0);
}

.element-8 {
    transform: translate(calc(-8 * 10px), calc(-8 * 10px));
}

.element-7 {
    transform: translate(calc(-7 * 10px), calc(-7 * 10px));
}

.element-6 {
    transform: translate(calc(-6 * 10px), 0);
}

.element-5 {
    transform: translate(calc(-5 * 10px), calc(-5 * 10px));
}

.element-4 {
    transform: translate(calc(-4 * 10px), calc(-4 * 10px));
}

.element-3 {
    transform: translate(calc(-3 * 10px), 0);
}

.element-2 {
    transform: translate(calc(-2 * 10px), calc(-2 * 10px));
}

.element-1 {
    transform: translate(calc(-1 * 10px), calc(-1 * 10px));
}

.element0 {
    transform: translate(calc(0 * 10px), 0);
}

.element1 {
    transform: translate(calc(1 * 10px), calc(1 * 10px));
}

.element2 {
    transform: translate(calc(2 * 10px), calc(2 * 10px));
}

.element3 {
    transform: translate(calc(3 * 10px), 0);
}

.element4 {
    transform: translate(calc(4 * 10px), calc(4 * 10px));
}

.element5 {
    transform: translate(calc(5 * 10px), calc(5 * 10px));
}

.element6 {
    transform: translate(calc(6 * 10px), 0);
}

.element7 {
    transform: translate(calc(7 * 10px), calc(7 * 10px));
}

.element8 {
    transform: translate(calc(8 * 10px), calc(8 * 10px));
}

.element9 {
    transform: translate(calc(9 * 10px), 0);
}
```

Mathematical statements work using [expr-eval](https://github.com/silentmatt/expr-eval), which allows for many advanced features