// Fix Grid components in MUI v7
const fs = require('fs');
const path = require('path');

// Function to find all Grid components with mixed props
function fixGridComponents(content) {
  // First pass: Convert all Grid items to use sx prop
  content = content.replace(/<Grid item xs={12}([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 12\' }}$1>');
  content = content.replace(/<Grid item xs={12} md={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 6\' } }}$1>');
  content = content.replace(/<Grid item xs={12} md={4}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 4\' } }}$1>');
  content = content.replace(/<Grid item xs={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 6\' }}$1>');
  content = content.replace(/<Grid item xs={6} md={4}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>');
  content = content.replace(/<Grid item xs={6} sm={4} md={3}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 6\', sm: \'span 4\', md: \'span 3\' } }}$1>');
  content = content.replace(/<Grid item xs={12} sm={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\' } }}$1>');
  content = content.replace(/<Grid item ([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 12\' }} $1>');
  
  // Second pass: Fix any Grid with both sx and xs/md props
  content = content.replace(/<Grid sx={{ gridColumn: 'span 6' }} md={4}([^>]*?)>/g, 
                         '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>');
  
  content = content.replace(/<Grid sx={{ gridColumn: 'span 12' }} md={([0-9]+)}([^>]*?)>/g, 
                         '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span $1\' } }}$2>');
                         
  content = content.replace(/<Grid sx={{ gridColumn: 'span ([0-9]+)' }} md={([0-9]+)}([^>]*?)>/g, 
                         '<Grid sx={{ gridColumn: { xs: \'span $1\', md: \'span $2\' } }}$3>');
  
  // Fix specific cases
  content = content.replace(/<Grid sx={{ gridColumn: 'span 12' }} xs={12} sm={6} md={4} key={post.id}>/g, 
                         '<Grid sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\', md: \'span 4\' } }} key={post.id}>');
  
  // Handle any remaining xs props
  content = content.replace(/<Grid sx={([^}]*?)} xs={([0-9]+)}([^>]*?)>/g, 
                         '<Grid sx={$1}$3>');
                         
  // Handle any remaining md props
  content = content.replace(/<Grid sx={([^}]*?)} md={([0-9]+)}([^>]*?)>/g, 
                         '<Grid sx={$1}$3>');
                         
  // Handle any remaining sm props
  content = content.replace(/<Grid sx={([^}]*?)} sm={([0-9]+)}([^>]*?)>/g, 
                         '<Grid sx={$1}$3>');
                         
  return content;
}

// Fix the about page
const aboutFilePath = path.join(process.cwd(), 'app/admin/about/page.tsx');
let aboutContent = fs.readFileSync(aboutFilePath, 'utf8');

// First run: Convert all item props to sx
aboutContent = fixGridComponents(aboutContent);

// Second run: Clean up any remaining xs/md props
aboutContent = fixGridComponents(aboutContent);

// Save the about page
fs.writeFileSync(aboutFilePath, aboutContent, 'utf8');
console.log('Grid components fixed in app/admin/about/page.tsx');

// Fix the blog page
const blogFilePath = path.join(process.cwd(), 'app/admin/blog/page.tsx');
let blogContent = fs.readFileSync(blogFilePath, 'utf8');

// Fix the blog page
blogContent = fixGridComponents(blogContent);
blogContent = fixGridComponents(blogContent);

// Manual fix for specific cases in blog page
blogContent = blogContent.replace(/<Grid sx={{ gridColumn: 'span 12' }} xs={12} sm={6} md={4} key={post\.id}>/g, 
                               '<Grid sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\', md: \'span 4\' } }} key={post.id}>');

blogContent = blogContent.replace(/<Grid sx={{ gridColumn: 'span 12' }} xs={12}>/g, 
                               '<Grid sx={{ gridColumn: \'span 12\' }}>');

// Save the blog page
fs.writeFileSync(blogFilePath, blogContent, 'utf8');
console.log('Grid components fixed in app/admin/blog/page.tsx'); 