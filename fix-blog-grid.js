// Fix Grid components in MUI v7 for the blog page
const fs = require('fs');
const path = require('path');

const blogFilePath = path.join(process.cwd(), 'app/admin/blog/page.tsx');
let content = fs.readFileSync(blogFilePath, 'utf8');

// Function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// First, let's find all Grid components with xs, sm, md props and replace them with sx prop
const gridRegexes = [
  {
    pattern: /<Grid([^>]*?)xs={12}([^>]*?)sm={6}([^>]*?)md={4}([^>]*?)>/g,
    replacement: '<Grid$1sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\', md: \'span 4\' } }}$2$3$4>'
  },
  {
    pattern: /<Grid([^>]*?)xs={12}([^>]*?)sm={6}([^>]*?)>/g,
    replacement: '<Grid$1sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\' } }}$2$3>'
  },
  {
    pattern: /<Grid([^>]*?)xs={12}([^>]*?)md={6}([^>]*?)>/g,
    replacement: '<Grid$1sx={{ gridColumn: { xs: \'span 12\', md: \'span 6\' } }}$2$3>'
  },
  {
    pattern: /<Grid([^>]*?)xs={12}([^>]*?)md={4}([^>]*?)>/g,
    replacement: '<Grid$1sx={{ gridColumn: { xs: \'span 12\', md: \'span 4\' } }}$2$3>'
  },
  {
    pattern: /<Grid([^>]*?)xs={12}([^>]*?)>/g,
    replacement: '<Grid$1sx={{ gridColumn: \'span 12\' }}$2>'
  },
  {
    pattern: /<Grid([^>]*?)xs={6}([^>]*?)md={4}([^>]*?)>/g,
    replacement: '<Grid$1sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$2$3>'
  },
  {
    pattern: /<Grid([^>]*?)xs={6}([^>]*?)>/g,
    replacement: '<Grid$1sx={{ gridColumn: \'span 6\' }}$2>'
  }
];

// Apply all regex replacements
gridRegexes.forEach(({ pattern, replacement }) => {
  content = content.replace(pattern, replacement);
});

// Now remove any remaining xs, sm, md props from Grid components that have sx prop
const cleanupRegexes = [
  {
    pattern: /<Grid([^>]*?)sx={([^>]*?)}([^>]*?)xs={[0-9]+}([^>]*?)>/g,
    replacement: '<Grid$1sx={$2}$3$4>'
  },
  {
    pattern: /<Grid([^>]*?)sx={([^>]*?)}([^>]*?)sm={[0-9]+}([^>]*?)>/g,
    replacement: '<Grid$1sx={$2}$3$4>'
  },
  {
    pattern: /<Grid([^>]*?)sx={([^>]*?)}([^>]*?)md={[0-9]+}([^>]*?)>/g,
    replacement: '<Grid$1sx={$2}$3$4>'
  }
];

// Apply all cleanup regex replacements
cleanupRegexes.forEach(({ pattern, replacement }) => {
  content = content.replace(pattern, replacement);
});

// Special case for the specific line causing the error
content = content.replace(
  /<Grid sx={{ gridColumn: 'span 12' }} xs={12} sm={6} md={4} key={post\.id}>/g,
  '<Grid sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\', md: \'span 4\' } }} key={post.id}>'
);

// Save the updated file
fs.writeFileSync(blogFilePath, content, 'utf8');
console.log('All Grid components in blog page have been fixed.'); 