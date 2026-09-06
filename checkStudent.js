const fs = require('fs');
const content = fs.readFileSync('packages/shared/src/data/mockData.ts', 'utf8');

// Check student-1 violations
const student1Violations = content.match(/"studentId": "student-1".*?"points": -?\d+/gs);
console.log('Student-1 violations:', student1Violations ? student1Violations.length : 0);
if (student1Violations) {
  student1Violations.forEach(v => console.log(v.substring(0, 100)));
}

// Check student-16 violations (first student without guardian call requirement)
const student16Violations = content.match(/"studentId": "student-16".*?"points": -?\d+/gs);
console.log('\nStudent-16 violations:', student16Violations ? student16Violations.length : 0);
if (student16Violations) {
  student16Violations.forEach(v => console.log(v.substring(0, 100)));
}