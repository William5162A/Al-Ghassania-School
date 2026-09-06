const fs = require('fs');
const content = fs.readFileSync('packages/shared/src/data/mockData.ts', 'utf8');

// Count violations
const violationMatches = content.match(/"id": "violation-\d+"/g);
console.log('Total violations:', violationMatches ? violationMatches.length : 0);

// Check violations with points
const pointsMatches = content.match(/"points": -?\d+/g);
console.log('Violations with points:', pointsMatches ? pointsMatches.length : 0);

// Check violations with 0 points
const zeroPoints = content.match(/"points": 0,/g);
console.log('Violations with 0 points:', zeroPoints ? zeroPoints.length : 0);

// Count students
const studentMatches = content.match(/"id": "student-\d+"/g);
console.log('Total students:', studentMatches ? studentMatches.length : 0);

// Check student totalPoints
const studentPointsMatches = content.match(/"totalPoints": 0,/g);
console.log('Students with totalPoints=0:', studentPointsMatches ? studentPointsMatches.length : 0);

// Count violations with valid points
let validPoints = 0;
let invalidPoints = 0;
const violationRegex = /"id": "violation-(\d+)".*?"points": (-?\d+)/gs;
let match1;
while ((match1 = violationRegex.exec(content)) !== null) {
  const points = parseInt(match1[2]);
  if (points !== 0) {
    validPoints++;
  } else {
    invalidPoints++;
  }
}
console.log('Violations with valid points:', validPoints);
console.log('Violations with invalid (0) points:', invalidPoints);

// Count violations per school
const schoolViolations = {};
const schoolRegex = /"schoolId": "(school-\d+)"/g;
let match2;
while ((match2 = schoolRegex.exec(content)) !== null) {
  const school = match2[1];
  schoolViolations[school] = (schoolViolations[school] || 0) + 1;
}
console.log('Violations per school:', schoolViolations);

// Sum of school violations
let totalSchoolViolations = 0;
for (const school in schoolViolations) {
  totalSchoolViolations += schoolViolations[school];
}
console.log('Total school violations:', totalSchoolViolations);

// Check student violation counts
const studentViolationRegex = /"studentId": "(student-\d+)"/g;
const studentViolationCounts = {};
let match3;
while ((match3 = studentViolationRegex.exec(content)) !== null) {
  const student = match3[1];
  studentViolationCounts[student] = (studentViolationCounts[student] || 0) + 1;
}
const totalStudentViolations = Object.values(studentViolationCounts).reduce((a, b) => a + b, 0);
console.log('Total student violations:', totalStudentViolations);