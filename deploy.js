const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'car-tuinning.firebasestorage.app'
});

const bucket = admin.storage().bucket();

async function deployToFirebase() {
  try {
    console.log('🚀 Starting deployment to Firebase Storage...');
    
    // Upload index.html
    const indexPath = path.join(__dirname, 'public', 'index.html');
    const indexFile = bucket.file('index.html');
    
    await indexFile.upload(indexPath, {
      metadata: {
        contentType: 'text/html',
        cacheControl: 'public, max-age=3600'
      }
    });
    
    console.log('✅ index.html uploaded successfully!');
    
    // Make the file publicly accessible
    await indexFile.makePublic();
    
    console.log('✅ File made publicly accessible!');
    console.log('🌐 Your site is now available at:');
    console.log(`   https://storage.googleapis.com/car-tuinning.firebasestorage.app/index.html`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

deployToFirebase();
