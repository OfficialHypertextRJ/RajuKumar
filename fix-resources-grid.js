// Fix Grid components in MUI v7 for the resources page
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/admin/resources/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Fix specific Grid components
const specificReplacements = [
  {
    from: '<Grid sx={{ gridColumn: \'span 12\' }} xs={12}>',
    to: '<Grid sx={{ gridColumn: \'span 12\' }}>'
  },
  {
    from: '<Grid sx={{ gridColumn: \'span 12\' }} xs={12} sm={6}>',
    to: '<Grid sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\' } }}>'
  },
  {
    from: '<Grid sx={{ gridColumn: \'span 12\' }} xs={12} md={6}>',
    to: '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 6\' } }}>'
  }
];

// Apply specific replacements
specificReplacements.forEach(({ from, to }) => {
  const escapedFrom = escapeRegExp(from);
  const regex = new RegExp(escapedFrom, 'g');
  content = content.replace(regex, to);
});

// Save the updated file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Grid components in resources page'); 