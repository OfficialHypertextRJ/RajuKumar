// Fix Grid components in MUI v7
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/admin/about/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Fix the specific case where both sx and xs/md props are present
content = content.replace(/<Grid sx={{ gridColumn: 'span 12' }} xs={6} md={4}([^>]*?)>/g, 
                         '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>');

// Fix other cases where both sx and xs/md props might be present
content = content.replace(/<Grid sx={{ gridColumn: 'span 12' }} xs={([0-9]+)}([^>]*?)>/g, 
                         '<Grid sx={{ gridColumn: \'span $1\' }}$2>');

content = content.replace(/<Grid sx={{ gridColumn: 'span 12' }} xs={([0-9]+)} md={([0-9]+)}([^>]*?)>/g, 
                         '<Grid sx={{ gridColumn: { xs: \'span $1\', md: \'span $2\' } }}$3>');

// Replace specific problematic Grid components first
const specificReplacements = [
  {
    from: '<Grid item xs={12} component="div">\n                <AdminFormField',
    to: '<Grid sx={{ gridColumn: \'span 12\' }} component="div">\n                <AdminFormField'
  },
  {
    from: '<Grid item xs={12} component="div">\n                  <Typography',
    to: '<Grid sx={{ gridColumn: \'span 12\' }} component="div">\n                  <Typography'
  }
];

// Apply specific replacements
specificReplacements.forEach(({ from, to }) => {
  content = content.replace(new RegExp(escapeRegExp(from), 'g'), to);
});

// General replacements for Grid components
const replacements = [
  { from: /<Grid item xs={12}([^>]*?)>/g, to: '<Grid sx={{ gridColumn: \'span 12\' }}$1>' },
  { from: /<Grid item xs={12} md={6}([^>]*?)>/g, to: '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 6\' } }}$1>' },
  { from: /<Grid item xs={12} md={4}([^>]*?)>/g, to: '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 4\' } }}$1>' },
  { from: /<Grid item xs={6}([^>]*?)>/g, to: '<Grid sx={{ gridColumn: \'span 6\' }}$1>' },
  { from: /<Grid item xs={6} md={4}([^>]*?)>/g, to: '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>' },
  // Handle any other Grid with item prop
  { from: /<Grid item ([^>]*?)>/g, to: '<Grid sx={{ gridColumn: \'span 12\' }} $1>' }
];

// Apply general replacements
replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Grid components fixed in app/admin/about/page.tsx'); 