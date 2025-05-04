// moduleB.js

/**
 * A simple class.
 */
export class Calculator {
  constructor() {
    // Simulate some delay
    const start = Date.now();
    while (Date.now() - start < 75) { // 75ms delay
      // busy wait
    }
    console.log('Module B loaded and Calculator instantiated');
    this.value = 0;
  }

  add(x) {
    this.value += x;
    return this.value;
  }
}

export const info = "This is Module B providing a Calculator";
