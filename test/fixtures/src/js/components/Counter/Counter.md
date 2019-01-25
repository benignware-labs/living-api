# Counter

Here's a counter example:

```js
console.log('hello eample');
// We define an ES6 class that extends HTMLElement
class Counter extends HTMLElement {
    constructor() {
      super();
      console.log('construct counter');
    }

    // Call when the counter changes value
    invalidate() {
      console.log('invalidate');
    }
}

console.log('register web component');

// This is where the actual element is defined for use in the DOM
customElements.define('counter-element', Counter);
```


```html
<counter-element>Hello World</counter-element>
```
