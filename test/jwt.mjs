import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import fs from 'node:fs';


// Generate a 256-bit (32-byte) random secret key
// const rawSecretKey = crypto.randomBytes(32).toString('hex');

// requires a secret key with a minimum size of 128 bits (16 bytes).
// it means that the secret key must be at least 16 characters long.
const rawSecretKey = 'mySecretKey12346';
const base64EncodedSecret = Buffer.from(rawSecretKey).toString('base64')
console.log('Base64-encoded secret:', base64EncodedSecret);

// Replace this with your actual secret key (Base64-encoded)

// Decode the Base64 secret key to get the original binary key
const secret = Buffer.from(base64EncodedSecret, 'base64');
console.log('Decoded secret:', secret);

// Example payload for the JWT
const payload = {
  userId: '1234567890',
  role: 'admin'
};

// Generate the JWT token
const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('Generated JWT:', token);

// Verify the token
jwt.verify(token, secret, (err, decoded) => {
  if (err) {
    console.error('JWT verification failed:', err.message);
  } else {
    console.log('Decoded payload:', decoded);
  }
});

// Generate RSA key pair
crypto.generateKeyPair(
  'rsa',
  {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  },
  (err, publicKey, privateKey) => {
    if (err) {
      console.error('Error generating key pair:', err);
      return;
    }

    // Create JWK object
    const jwk = {
      kty: 'RSA',
      kid: 'unique-key-id',
      use: 'sig', // For signing (use 'enc' for encryption)
      alg: 'RS256', // The algorithm used (e.g., RS256 for RSA-SHA256)
      n: publicKey.split('\n').slice(1, -1).join(''), // Remove the first and last line breaks
      e: 'AQAB' // Public exponent, typically 'AQAB'
    };

    // Save JWK to a file (optional)
    fs.writeFileSync('jwk_rsa.json', JSON.stringify(jwk, null, 2));

    console.log('Generated JWK:', jwk);
  }
);
