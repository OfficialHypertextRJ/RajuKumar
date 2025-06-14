/**
 * Firebase Google Authentication Setup Helper
 * 
 * This script helps open the Firebase console to enable Google Authentication.
 * Run with: node enable-google-auth.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('Firebase Google Authentication Setup Helper');
console.log('========================================\n');

// Check if .firebaserc exists to get project ID
try {
  const firebaserc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
  const projectId = firebaserc.projects.default;
  
  if (!projectId) {
    console.error('No default project found in .firebaserc');
    process.exit(1);
  }
  
  console.log(`Found Firebase project: ${projectId}`);
  console.log('\nTo fix the "auth/operation-not-allowed" error, you need to enable Google Authentication in your Firebase project.\n');
  
  // Construct the direct URL to the authentication providers page
  const authProvidersUrl = `https://console.firebase.google.com/project/${projectId}/authentication/providers`;
  
  console.log('Steps to enable Google Authentication:');
  console.log('1. Click on "Google" in the list of providers');
  console.log('2. Toggle the "Enable" switch to ON');
  console.log('3. Enter your project support email (hypertextrj@gmail.com)');
  console.log('4. Click "Save"\n');
  
  rl.question('Do you want to open the Firebase Authentication providers page now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log(`Opening ${authProvidersUrl} in your default browser...`);
      
      // Open the URL in the default browser
      const openCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
      exec(`${openCommand} ${authProvidersUrl}`, (error) => {
        if (error) {
          console.error('Failed to open browser:', error);
        }
        
        console.log('\nAfter enabling Google Authentication:');
        console.log('1. Restart your Next.js development server: npm run dev');
        console.log('2. Try signing in with Google again at http://localhost:3000/admin/login');
        
        rl.close();
      });
    } else {
      console.log('\nYou can manually open the Firebase Authentication providers page at:');
      console.log(authProvidersUrl);
      
      console.log('\nAfter enabling Google Authentication:');
      console.log('1. Restart your Next.js development server: npm run dev');
      console.log('2. Try signing in with Google again at http://localhost:3000/admin/login');
      
      rl.close();
    }
  });
} catch (error) {
  console.error('Failed to read .firebaserc:', error);
  console.log('\nPlease follow these manual steps:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Click on "Authentication" in the left sidebar');
  console.log('4. Click on the "Sign-in method" tab');
  console.log('5. Find "Google" in the list and enable it');
  console.log('6. Save your changes');
  console.log('7. Restart your Next.js development server and try again');
  
  rl.close();
} 