// main.js (External Test)

// Import from the installed package
import profileImport from 'util--profiler--viscera';

console.log('Starting main execution (External Test)...');

async function run() {
  try {
    console.log('Attempting to load Module A...');
    // The second argument MUST be import.meta.url from the *calling* file (this main.js)
    const moduleA = await profileImport('./moduleA.js', import.meta.url);
    console.log('Module A import resolved.');
    const greeting = moduleA.greet('External World');
    console.log(`Greeting received: ${greeting}`);

    console.log('\nAttempting to load Module B...');
    const { Calculator } = await profileImport('./moduleB.js', import.meta.url);
    console.log('Module B import resolved.');
    const calc = new Calculator();
    calc.add(50);
    calc.add(100);
    console.log(`Calculator final value: ${calc.value}`);

  } catch (error) {
    console.error('An error occurred during dynamic import:', error);
  }

  console.log('\nMain execution finished (External Test).');
}

run();
