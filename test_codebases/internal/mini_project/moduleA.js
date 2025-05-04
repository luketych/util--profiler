// moduleA.js

/**
 * A simple function to simulate work.
 * @param {string} name 
 * @returns {string}
 */
export function greet(name) {
  // Simulate some delay
  const start = Date.now();
  while (Date.now() - start < 50) { // 50ms delay
    // busy wait
  }
  console.log('Module A loaded and executed greet()');
  return `Hello, ${name}! from Module A`;
}

export const description = "This is Module A";
