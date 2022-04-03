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

    color: colorName !important;

    anotherFunction(colorName);
}

function anotherFunction(anotherParameter) {
    // This is a JS comment
    margin: 3rem;

    background-color: var(--defaultColor, anotherParameter);

    // Wait parameters might work in comments, anotherParameter

    for(var loopIteration = -3; loopIteration < 3; loopIteration++) {
        .elementloopIteration {
            transform: translate(calc(loopIteration * 10px), 0);
        }
    }
}
```

After:
```
h1 {
    font-size: 10rem;
    color: red; /* This is a JS comment */
    /* This is a JS comment on a new line */
    /* And this is a CSS comment */
    /* This is a JS variable definition */
    --coolThing: 5rem; --otherCoolThing: 6rem;

    --defaultColor: purple;

    /* This is a CSS variable definition */
    --CSScoolThing: 3rem;

    /* This is a JS comment */
    
    color: orange !important;
    
    /* This is a JS comment */
    margin: 3rem;
    
    background-color: var(--defaultColor, orange);
    
    /* Wait parameters might work in comments, orange */
    
    .element-3 {
    transform: translate(calc(-3 * 10px), 0);
    }
    .element-2 {
    transform: translate(calc(-2 * 10px), 0);
    }
    .element-1 {
    transform: translate(calc(-1 * 10px), 0);
    }
    .element0 {
    transform: translate(calc(0 * 10px), 0);
    }
    .element1 {
    transform: translate(calc(1 * 10px), 0);
    }
    .element2 {
    transform: translate(calc(2 * 10px), 0);
    }
    
    
}


```

Mathematical statements work using [expr-eval](https://github.com/silentmatt/expr-eval), which allows for many advanced features. 