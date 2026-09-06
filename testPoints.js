const fs = require('fs');
const path = require('path');

// Load the mock data
const mockDataPath = path.join(__dirname, 'packages/shared/src/data/mockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf8');

// Extract the violations array
const violationsRegex = /export const violations: Violation\[\] = (\[[\s\S]*?\]);/;
const vMatch = content.match(violationsRegex);
if (!vMatch) {
  console.log('Could not find violations array');
  process.exit(1);
}

const violations = eval('(' + vMatch[1] + ')');
console.log('Total violations:', violations.length);

// Get all violations for student-1
const student1Violations = violations.filter(v => v.studentId === 'student-1');
console.log('\nStudent-1 violations:', student1Violations.length);
let total = 0;
student1Violations.forEach(v => {
  console.log(`  ${v.violationTypeId}: ${v.points}`);
  total += v.points;
});
console.log('Total points for student-1:', total);

// Check student-16
const student16Violations = violations.filter(v => v.studentId === 'student-16');
console.log('\nStudent-16 violations:', student16Violations.length);
let total16 = 0;
student16Violations.forEach(v => {
  console.log(`  ${v.violationTypeId}: ${v.points}`);
  total16 += v.points;
});
console.log('Total points for student-16:', total16);

// Test calculateStudentPoints function
function calculateStudentPoints(studentId, violations) {
  return violations
    .filter(v => v.studentId === studentId)
    .reduce((sum, v) => sum + v.points, 0);
}

console.log('\n--- Testing calculateStudentPoints ---');
console.log('student-1:', calculateStudentPoints('student-1', violations));
console.log('student-16:', calculateStudentPoints('student-16', violations));

// Guardian calls
const guardianCallsRegex = /export const guardianCalls: GuardianCall\[\] = (\[[\s\S]*?\]);/;
const gcMatch = content.match(guardianCallsRegex);
const guardianCalls = eval('(' + gcMatch[1] + ')');
console.log('\nTotal guardian calls:', guardianCalls.length);

// Test calculateCurrentCyclePoints
function calculateCurrentCyclePoints(studentId, violations, guardianCalls) {
  const studentCalls = guardianCalls
    .filter(c => c.studentId === studentId && c.status === 'contacted')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (studentCalls.length === 0) {
    return violations
      .filter(v => v.studentId === studentId)
      .reduce((sum, v) => sum + v.points, 0);
  }

  const latestCall = studentCalls[0];
  const latestCallDate = new Date(latestCall.date).getTime();

  return violations
    .filter(v => v.studentId === studentId && new Date(v.date).getTime() > latestCallDate)
    .reduce((sum, v) => sum + v.points, 0);
}

console.log('\n--- Guardian Call Cycle Test ---');
const student1Calls = guardianCalls.filter(c => c.studentId === 'student-1');
console.log('Student-1 guardian calls:', student1Calls.length);
if (student1Calls.length > 0) {
  student1Calls.forEach(c => console.log(`  Call: ${c.date}, status: ${c.status}`));
}

const currentCycle = calculateCurrentCyclePoints('student-1', violations, guardianCalls);
console.log('Student-1 current cycle points:', currentCycle);

// Check student-16
const student16Calls = guardianCalls.filter(c => c.studentId === 'student-16');
console.log('\nStudent-16 guardian calls:', student16Calls.length);
const currentCycle16 = calculateCurrentCyclePoints('student-16', violations, guardianCalls);
console.log('Student-16 current cycle points:', currentCycle16);

// Test isGuardianCallRequired
function isGuardianCallRequired(studentId, violations, guardianCalls, threshold = -100) {
  const currentCyclePoints = calculateCurrentCyclePoints(studentId, violations, guardianCalls);
  return currentCyclePoints <= threshold;
}

console.log('\n--- Guardian Call Required ---');
console.log('Student-1 requires call:', isGuardianCallRequired('student-1', violations, guardianCalls));
console.log('Student-16 requires call:', isGuardianCallRequired('student-16', violations, guardianCalls));