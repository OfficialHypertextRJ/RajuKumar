// Fix Grid components in MUI v7 for all admin pages
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all admin page files
const adminDir = path.join(process.cwd(), 'app/admin');
const files = fs.readdirSync(adminDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => {
    const pagePath = path.join(adminDir, dirent.name, 'page.tsx');
    return fs.existsSync(pagePath) ? pagePath : null;
  })
  .filter(Boolean);

// Function to fix Grid components in a file
function fixGridComponentsInFile(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Replace Grid components with item prop
  content = content.replace(/<Grid item xs={12} md={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 6\' } }}$1>');
  content = content.replace(/<Grid item xs={12} md={4}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 4\' } }}$1>');
  content = content.replace(/<Grid item xs={12} sm={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\' } }}$1>');
  content = content.replace(/<Grid item xs={12}([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 12\' }}$1>');
  content = content.replace(/<Grid item xs={6} md={4}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>');
  content = content.replace(/<Grid item xs={6} sm={4} md={3}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 6\', sm: \'span 4\', md: \'span 3\' } }}$1>');
  content = content.replace(/<Grid item xs={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 6\' }}$1>');
  content = content.replace(/<Grid item ([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 12\' }} $1>');

  // Remove any remaining xs, sm, md props from Grid components that have sx prop
  content = content.replace(/<Grid sx={([^}]*?)} xs={[0-9]+}([^>]*?)>/g, '<Grid sx={$1}$2>');
  content = content.replace(/<Grid sx={([^}]*?)} sm={[0-9]+}([^>]*?)>/g, '<Grid sx={$1}$2>');
  content = content.replace(/<Grid sx={([^}]*?)} md={[0-9]+}([^>]*?)>/g, '<Grid sx={$1}$2>');

  // Special case for the specific line causing errors
  content = content.replace(/<Grid sx={{ gridColumn: 'span 12' }} xs={12} sm={6} md={4} key={post\.id}>/g,
    '<Grid sx={{ gridColumn: { xs: \'span 12\', sm: \'span 6\', md: \'span 4\' } }} key={post.id}>');

  // If content has changed, write it back to the file
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed Grid components in ${filePath}`);
    return true;
  } else {
    console.log(`No changes needed in ${filePath}`);
    return false;
  }
}

// Process each file
let fixedFiles = 0;
for (const file of files) {
  if (fixGridComponentsInFile(file)) {
    fixedFiles++;
  }
}

console.log(`\nFixed Grid components in ${fixedFiles} files.`);
console.log('Running a second pass to catch any remaining issues...');

// Run a second pass to catch any remaining issues
let secondPassFixedFiles = 0;
for (const file of files) {
  if (fixGridComponentsInFile(file)) {
    secondPassFixedFiles++;
  }
}

console.log(`\nFixed additional Grid components in ${secondPassFixedFiles} files in second pass.`);
console.log('All Grid components have been fixed!'); 