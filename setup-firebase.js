/**
 * Firebase Setup Script
 * 
 * This script helps initialize and configure a Firebase project for the Portfolio Admin Panel.
 * Run with: node setup-firebase.js
 * 
 * Prerequisites:
 * 1. Firebase CLI installed: npm install -g firebase-tools
 * 2. Firebase account
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
console.log('Firebase Setup for Portfolio Admin Panel');
console.log('========================================\n');

console.log('This script will help you set up Firebase for your Portfolio Admin Panel.');
console.log('Make sure you have a Firebase account and the Firebase CLI installed.\n');

// Step 1: Check if Firebase CLI is installed
console.log('Step 1: Checking if Firebase CLI is installed...');
exec('firebase --version', (error) => {
  if (error) {
    console.error('Firebase CLI is not installed. Please install it with: npm install -g firebase-tools');
    console.log('After installing, run this script again.');
    process.exit(1);
  }
  
  console.log('Firebase CLI is installed. Proceeding...\n');
  
  // Step 2: Login to Firebase
  console.log('Step 2: Logging in to Firebase...');
  console.log('A browser window will open for you to log in to your Firebase account.');
  
  exec('firebase login', (error, stdout) => {
    if (error) {
      console.error('Failed to log in to Firebase:', error);
      process.exit(1);
    }
    
    console.log(stdout);
    console.log('Successfully logged in to Firebase.\n');
    
    // Step 3: Create or select a Firebase project
    console.log('Step 3: Creating or selecting a Firebase project...');
    
    rl.question('Do you want to create a new project or use an existing one? (new/existing): ', (answer) => {
      if (answer.toLowerCase() === 'new') {
        // Create a new project
        rl.question('Enter a name for your new Firebase project: ', (projectName) => {
          console.log(`Creating new Firebase project: ${projectName}...`);
          
          exec(`firebase projects:create --display-name="${projectName}"`, (error, stdout) => {
            if (error) {
              console.error('Failed to create Firebase project:', error);
              process.exit(1);
            }
            
            console.log(stdout);
            console.log(`Firebase project ${projectName} created successfully.\n`);
            
            // Extract project ID from stdout
            const projectIdMatch = stdout.match(/Project ID: ([a-z0-9-]+)/);
            const projectId = projectIdMatch ? projectIdMatch[1] : null;
            
            if (!projectId) {
              console.error('Failed to extract project ID from Firebase output.');
              process.exit(1);
            }
            
            // Update .firebaserc
            const firebaserc = {
              projects: {
                default: projectId
              }
            };
            
            fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
            console.log('Updated .firebaserc with the new project ID.\n');
            
            setupFirebaseServices(projectId);
          });
        });
      } else {
        // Use an existing project
        exec('firebase projects:list', (error, stdout) => {
          if (error) {
            console.error('Failed to list Firebase projects:', error);
            process.exit(1);
          }
          
          console.log('Available Firebase projects:');
          console.log(stdout);
          
          rl.question('Enter the project ID you want to use: ', (projectId) => {
            console.log(`Using existing Firebase project: ${projectId}...`);
            
            exec(`firebase use ${projectId}`, (error, stdout) => {
              if (error) {
                console.error('Failed to select Firebase project:', error);
                process.exit(1);
              }
              
              console.log(stdout);
              console.log(`Firebase project ${projectId} selected successfully.\n`);
              
              // Update .firebaserc
              const firebaserc = {
                projects: {
                  default: projectId
                }
              };
              
              fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
              console.log('Updated .firebaserc with the selected project ID.\n');
              
              setupFirebaseServices(projectId);
            });
          });
        });
      }
    });
  });
});

function setupFirebaseServices(projectId) {
  console.log('Step 4: Setting up Firebase services...');
  
  // Enable Firestore
  console.log('Enabling Firestore...');
  exec(`firebase firestore:enable --project ${projectId}`, (error) => {
    if (error) {
      console.log('Firestore might already be enabled or needs to be enabled manually.');
      console.log('Please visit the Firebase Console to enable Firestore if needed.\n');
    } else {
      console.log('Firestore enabled successfully.\n');
    }
    
    // Enable Storage
    console.log('Enabling Storage...');
    exec(`firebase storage:enable --project ${projectId}`, (error) => {
      if (error) {
        console.log('Storage might already be enabled or needs to be enabled manually.');
        console.log('Please visit the Firebase Console to enable Storage if needed.\n');
      } else {
        console.log('Storage enabled successfully.\n');
      }
      
      // Enable Authentication
      console.log('Enabling Authentication...');
      console.log('Authentication needs to be enabled manually from the Firebase Console.');
      console.log('Please visit the Firebase Console and enable Google Authentication.\n');
      
      // Deploy rules
      console.log('Step 5: Deploying security rules...');
      exec(`firebase deploy --only firestore:rules,storage --project ${projectId}`, (error, stdout) => {
        if (error) {
          console.error('Failed to deploy security rules:', error);
          console.log('You can deploy them later using: npm run firebase:rules');
        } else {
          console.log(stdout);
          console.log('Security rules deployed successfully.\n');
        }
        
        console.log('Step 6: Setting up environment variables...');
        console.log('Please create a .env.local file with your Firebase configuration.');
        console.log('You can find your Firebase configuration in the Firebase Console:');
        console.log('  1. Go to Project Settings (gear icon)');
        console.log('  2. Scroll down to "Your apps" and click the web app icon (</>)');
        console.log('  3. Copy the configuration object and add it to your .env.local file\n');
        
        console.log('========================================');
        console.log('Firebase setup complete!');
        console.log('========================================\n');
        
        console.log('Next steps:');
        console.log('1. Enable Google Authentication in the Firebase Console');
        console.log('2. Create a .env.local file with your Firebase configuration');
        console.log('3. Start your development server: npm run dev');
        console.log('4. Visit http://localhost:3000/admin/login to access the admin panel');
        
        rl.close();
      });
    });
  });
} 