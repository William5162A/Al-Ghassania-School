const fs = require('fs');
const path = require('path');
const content = fs.readFileSync('packages/shared/src/data/mockData.ts', 'utf8');

// Check sections
const sectionsMatch = content.match(/export const sections: Section\[\] = (\[[\s\S]*?\]);/);
if (sectionsMatch) {
  const sections = eval('(' + sectionsMatch[1] + ')');
  console.log('Total sections:', sections.length);
  
  // Group by class and academic year
  const sectionsByClassYear = {};
  sections.forEach(s => {
    const key = `${s.classId}-${s.academicYearId}`;
    if (!sectionsByClassYear[key]) sectionsByClassYear[key] = [];
    sectionsByClassYear[key].push(s);
  });
  
  console.log('\nSections per class per academic year:');
  let allThree = true;
  for (const [key, secs] of Object.entries(sectionsByClassYear)) {
    const count = secs.length;
    if (count !== 3) {
      console.log(`  ${key}: ${count} sections`);
      allThree = false;
    }
  }
  if (allThree) {
    console.log('  All classes have exactly 3 sections per academic year ✓');
  }
  
  // Total sections
  console.log('\nTotal sections:', Object.keys(sectionsByClassYear).length * 3);
}

// Check classes
const classesMatch = content.match(/export const classes: Class\[\] = (\[[\s\S]*?\]);/);
if (classesMatch) {
  const classes = eval('(' + classesMatch[1] + ')');
  console.log('\nTotal classes:', classes.length);
  classes.forEach(c => console.log(`  ${c.id}: ${c.name} (${c.category})`));
}

// Check academic years
const ayMatch = content.match(/export const academicYears: AcademicYear\[\] = (\[[\s\S]*?\]);/);
if (ayMatch) {
  const academicYears = eval('(' + ayMatch[1] + ')');
  console.log('\nAcademic years:', academicYears.length);
  academicYears.forEach(ay => console.log(`  ${ay.id}: ${ay.name} (${ay.status})`));
}