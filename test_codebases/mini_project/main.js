import profileImport from '../../viscera/src/profileImport.js';
// main.js

console.log('Starting main execution...');

async function run() {
  try {
    console.log('Attempting to load Module A...');
    const moduleA = await profileImport('./moduleA.js', import.meta.url, null, '__AUTO_PROFILE__');
    console.log('Module A import resolved.');
    const greeting = moduleA.greet('World');
    console.log(`Greeting received: ${greeting}`);

    console.log('\nAttempting to load Module B...');
    const { Calculator } = await profileImport('./moduleB.js', import.meta.url, null, '__AUTO_PROFILE__'); // Destructure class
    console.log('Module B import resolved.');
    const calc = new Calculator();
    calc.add(5);
    calc.add(10);
    console.log(`Calculator final value: ${calc.value}`);

  } catch (error) {
    console.error('An error occurred during dynamic import:', error);
  }

  console.log('\nMain execution finished.');
}

run();
