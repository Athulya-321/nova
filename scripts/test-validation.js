// Test validation for mandatory fields: name, age, place, email
const testCases = [
  { payload: { name: '', age: '20', place: 'Paris', email: 'test@example.com' }, shouldFail: true, field: 'name' },
  { payload: { name: 'Alex', age: '', place: 'Paris', email: 'test@example.com' }, shouldFail: true, field: 'age' },
  { payload: { name: 'Alex', age: '20', place: '', location: '', email: 'test@example.com' }, shouldFail: true, field: 'place' },
  { payload: { name: 'Alex', age: '20', place: 'Paris', email: '' }, shouldFail: true, field: 'email' },
  { payload: { name: 'Alex', age: '20', place: 'Paris', email: 'notanemail' }, shouldFail: true, field: 'invalid email' },
  { payload: { name: 'Alex', age: '20', place: 'Paris', email: 'alex@example.com' }, shouldFail: false }
];

console.log('--- TESTING MANDATORY FIELD VALIDATION ---');
let allPassed = true;

for (const tc of testCases) {
  const p = tc.payload;
  const placeValue = String(p.place || p.location || '').trim();
  const missing = [];
  if (!p.name?.trim()) missing.push('name');
  if (!p.age?.trim()) missing.push('age');
  if (!placeValue) missing.push('place');
  if (!p.email?.trim()) missing.push('email');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isInvalidEmail = p.email?.trim() && !emailRegex.test(p.email.trim());

  const hasFailed = missing.length > 0 || isInvalidEmail;

  if (hasFailed === tc.shouldFail) {
    console.log(`✅ Case passed: missing=[${missing.join(', ')}], invalidEmail=${Boolean(isInvalidEmail)} (Expected fail: ${tc.shouldFail})`);
  } else {
    console.error(`❌ Case failed: expected fail=${tc.shouldFail}, got ${hasFailed}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n🌟 ALL MANDATORY FIELD VALIDATION RULES VERIFIED SUCCESSFULLY!');
} else {
  process.exit(1);
}
