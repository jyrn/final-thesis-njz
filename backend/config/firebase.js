const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<DecodedIdToken>} Decoded token
 */
const verifyIdToken = async (idToken) => {
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
};

/**
 * Get Firebase user by UID
 * @param {string} uid - Firebase user UID
 * @returns {Promise<UserRecord>} Firebase user record
 */
const getUserByUid = async (uid) => {
  try {
    return await admin.auth().getUser(uid);
  } catch (error) {
    console.error('Error getting user by UID:', error);
    throw error;
  }
};

/**
 * Create custom token for user
 * @param {string} uid - Firebase user UID
 * @param {Object} additionalClaims - Additional claims to include in token
 * @returns {Promise<string>} Custom token
 */
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    return await admin.auth().createCustomToken(uid, additionalClaims);
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
};

/**
 * Update user custom claims
 * @param {string} uid - Firebase user UID
 * @param {Object} customClaims - Custom claims to set
 * @returns {Promise<void>}
 */
const setCustomUserClaims = async (uid, customClaims) => {
  try {
    await admin.auth().setCustomUserClaims(uid, customClaims);
  } catch (error) {
    console.error('Error setting custom user claims:', error);
    throw error;
  }
};

/**
 * Delete Firebase user
 * @param {string} uid - Firebase user UID
 * @returns {Promise<void>}
 */
const deleteUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

module.exports = {
  admin,
  verifyIdToken,
  getUserByUid,
  createCustomToken,
  setCustomUserClaims,
  deleteUser
};
