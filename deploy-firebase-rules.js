/**
 * Firebase Rules Deployment Script
 * 
 * This script helps deploy Firestore and Storage rules to Firebase.
 * Run with: node deploy-firebase-rules.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('Firebase Rules Deployment Helper');
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
  console.log('\nThis script will deploy your Firestore and Storage security rules to Firebase.\n');
  
  rl.question('Do you want to continue? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\nDeploying Firestore and Storage rules...');
      
      exec(`firebase deploy --only firestore:rules,storage --project ${projectId}`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error deploying rules:', error);
          console.error(stderr);
          rl.close();
          return;
        }
        
        console.log(stdout);
        console.log('\nFirestore and Storage rules deployed successfully!');
        console.log('\nYou can verify the rules in the Firebase Console:');
        console.log(`https://console.firebase.google.com/project/${projectId}/firestore/rules`);
        console.log(`https://console.firebase.google.com/project/${projectId}/storage/rules`);
        
        rl.close();
      });
    } else {
      console.log('\nDeployment cancelled.');
      rl.close();
    }
  });
} catch (error) {
  console.error('Failed to read .firebaserc:', error);
  console.log('\nPlease make sure you have initialized Firebase in this project:');
  console.log('1. Run: firebase login');
  console.log('2. Run: firebase init');
  console.log('3. Select Firestore and Storage options');
  console.log('4. Try running this script again');
  
  rl.close();
} 