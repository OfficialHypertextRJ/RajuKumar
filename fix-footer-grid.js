// Fix Grid components in MUI v7 for the footer page
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/admin/footer/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// First, let's find all Grid components with xs, sm, md props and replace them with sx prop
const gridRegexes = [
  {
    pattern: /<Grid item xs={12} md={6}([^>]*?)>/g,
    replacement: '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 6\' } }}$1>'
  },
  {
    pattern: /<Grid item xs={12} md={4}([^>]*?)>/g,
    replacement: '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 4\' } }}$1>'
  },
  {
    pattern: /<Grid item xs={12}([^>]*?)>/g,
    replacement: '<Grid sx={{ gridColumn: \'span 12\' }}$1>'
  },
  {
    pattern: /<Grid item xs={6}([^>]*?)>/g,
    replacement: '<Grid sx={{ gridColumn: \'span 6\' }}$1>'
  },
  {
    pattern: /<Grid item xs={6} md={4}([^>]*?)>/g,
    replacement: '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>'
  }
];

// Apply all regex replacements
gridRegexes.forEach(({ pattern, replacement }) => {
  content = content.replace(pattern, replacement);
});

// Save the updated file
fs.writeFileSync(filePath, content, 'utf8');
console.log('All Grid components in footer page have been fixed.'); 