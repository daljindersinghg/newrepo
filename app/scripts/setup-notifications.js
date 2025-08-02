#!/usr/bin/env node

/**
 * Setup script for Firebase Push Notifications
 * Run with: node scripts/setup-notifications.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupFirebaseConfig() {
  console.log('🔥 Firebase Push Notifications Setup\n');
  console.log('Before starting, make sure you have:');
  console.log('1. Created a Firebase project');
  console.log('2. Enabled Cloud Messaging');
  console.log('3. Generated a web app config');
  console.log('4. Created VAPID keys\n');

  const proceed = await question('Do you want to continue? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    process.exit(0);
  }

  console.log('\n📝 Please enter your Firebase configuration:');

  const config = {
    NEXT_PUBLIC_FIREBASE_API_KEY: await question('API Key: '),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: await question('Auth Domain (project-id.firebaseapp.com): '),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: await question('Project ID: '),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: await question('Storage Bucket (project-id.appspot.com): '),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: await question('Messaging Sender ID: '),
    NEXT_PUBLIC_FIREBASE_APP_ID: await question('App ID: '),
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: await question('VAPID Key: '),
  };

  // Update .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Add Firebase config
  envContent += '\n\n# Firebase Configuration (Auto-generated)\n';
  Object.entries(config).forEach(([key, value]) => {
    if (value.trim()) {
      envContent += `${key}=${value}\n`;
    }
  });

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Environment variables updated in .env file');

  // Update service worker
  const swPath = path.join(process.cwd(), 'public', 'firebase-messaging-sw.js');
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    
    // Replace placeholder config
    const firebaseConfig = {
      apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: config.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    swContent = swContent.replace(
      /const firebaseConfig = {[\s\S]*?};/,
      `const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};`
    );

    fs.writeFileSync(swPath, swContent);
    console.log('✅ Service worker configuration updated');
  }

  // Create test script
  const testScript = `#!/usr/bin/env node

/**
 * Test Firebase notification setup
 * Run with: node scripts/test-notifications.js [FCM_TOKEN]
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add service account)
const serviceAccount = {
  // Add your service account JSON here
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: '${config.NEXT_PUBLIC_FIREBASE_PROJECT_ID}'
  });
}

async function testNotification(token) {
  if (!token) {
    console.log('Usage: node scripts/test-notifications.js [FCM_TOKEN]');
    console.log('Get FCM token from browser console after enabling notifications');
    process.exit(1);
  }

  const message = {
    notification: {
      title: '🧪 Test Notification',
      body: 'Firebase push notifications are working correctly!',
      icon: '/NearMe .Ai (350 x 180 px).png'
    },
    data: {
      testMessage: 'true',
      timestamp: new Date().toISOString()
    },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Test notification sent successfully!');
    console.log('Message ID:', response);
  } catch (error) {
    console.error('❌ Test notification failed:', error.message);
    
    if (error.code === 'messaging/invalid-registration-token') {
      console.log('The FCM token is invalid or expired');
    } else if (error.code === 'messaging/registration-token-not-registered') {
      console.log('The FCM token is not registered');
    }
  }
}

const token = process.argv[2];
testNotification(token);
`;

  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'test-notifications.js'), testScript);
  console.log('✅ Test script created at scripts/test-notifications.js');

  console.log('\n🎉 Setup complete! Next steps:');
  console.log('1. Install dependencies: npm install firebase');
  console.log('2. Set up your backend API endpoints (see PRODUCTION_SETUP_GUIDE.md)');
  console.log('3. Deploy your application');
  console.log('4. Test notifications with: node scripts/test-notifications.js [FCM_TOKEN]');
  console.log('\n📖 For detailed production setup, see PRODUCTION_SETUP_GUIDE.md');

  rl.close();
}

async function createDirectories() {
  const dirs = [
    'scripts',
    'lib/firebase',
    'lib/services', 
    'hooks',
    'providers',
    'components/notifications',
    'components/clinic'
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

async function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found. Please run this from your project root.');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = packageJson.dependencies || {};

  const required = ['firebase'];
  const missing = required.filter(dep => !dependencies[dep]);

  if (missing.length > 0) {
    console.log('⚠️  Missing dependencies:', missing.join(', '));
    console.log('Run: npm install ' + missing.join(' '));
  } else {
    console.log('✅ All required dependencies are installed');
  }
}

async function main() {
  try {
    await createDirectories();
    await checkDependencies();
    await setupFirebaseConfig();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupFirebaseConfig, createDirectories, checkDependencies };