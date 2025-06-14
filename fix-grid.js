// Fix Grid components in MUI v7
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/admin/about/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Grid item with sx prop
content = content.replace(/<Grid item xs={12}([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 12\' }}$1>');
content = content.replace(/<Grid item xs={12} md={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 6\' } }}$1>');
content = content.replace(/<Grid item xs={12} md={4}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 12\', md: \'span 4\' } }}$1>');
content = content.replace(/<Grid item xs={6}([^>]*?)>/g, '<Grid sx={{ gridColumn: \'span 6\' }}$1>');
content = content.replace(/<Grid item xs={6} md={4}([^>]*?)>/g, '<Grid sx={{ gridColumn: { xs: \'span 6\', md: \'span 4\' } }}$1>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Grid components fixed in app/admin/about/page.tsx'); 