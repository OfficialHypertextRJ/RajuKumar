// Fix Grid components in MUI v7
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/admin/about/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Function to find all Grid components with mixed props
function fixAllGridComponents() {
  // First pass: Convert all Grid items to use sx prop
  content = content.replace(/<Grid item xs={12}([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 12\' }}$1>');
  content = content.replace(/<Grid item xs={12} md={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 6\' } }}$1>');
  content = content.replace(/<Grid item xs={12} md={4}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 4\' } }}$1>');
  content = content.replace(/<Grid item xs={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 6\' }}$1>');
  content = content.replace(/<Grid item xs={6} md={4}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>');
  content = content.replace(/<Grid item ([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 12\' }} $1>');
  
  // Second pass: Fix any Grid with both sx and xs/md props
  content = content.replace(/<Grid sx={{ gridColumn: 'span 6' }} md={4}([^>]*?)>/g, 
                           '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>');
  
  content = content.replace(/<Grid sx={{ gridColumn: 'span 12' }} md={([0-9]+)}([^>]*?)>/g, 
                           '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span $1\' } }}$2>');
                           
  content = content.replace(/<Grid sx={{ gridColumn: 'span ([0-9]+)' }} md={([0-9]+)}([^>]*?)>/g, 
                           '<Grid sx={{ gridColumn: { xs: \'span $1\', md: \'span $2\' } }}$3>');
  
  // Handle any remaining xs props
  content = content.replace(/<Grid sx={([^}]*?)} xs={([0-9]+)}([^>]*?)>/g, 
                           '<Grid sx={$1}$3>');
                           
  // Handle any remaining md props
  content = content.replace(/<Grid sx={([^}]*?)} md={([0-9]+)}([^>]*?)>/g, 
                           '<Grid sx={$1}$3>');
}

// First run: Convert all item props to sx
fixAllGridComponents();

// Second run: Clean up any remaining xs/md props
fixAllGridComponents();

// Special case for the specific error
content = content.replace(/<Grid sx={{ gridColumn: 'span 6' }} md={4} key={imageIndex} component="div">/g, 
                         '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }} key={imageIndex} component="div">');

// Manual fix for any specific instances that might still have issues
const manualFixes = [
  {
    from: '<Grid sx={{ gridColumn: \'span 6\' }} md={4} key={imageIndex} component="div">',
    to: '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }} key={imageIndex} component="div">'
  },
  {
    from: '<Grid sx={{ gridColumn: \'span 12\' }} xs={6} md={4} component="div">',
    to: '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }} component="div">'
  }
];

manualFixes.forEach(({ from, to }) => {
  content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Grid components fixed in app/admin/about/page.tsx'); 