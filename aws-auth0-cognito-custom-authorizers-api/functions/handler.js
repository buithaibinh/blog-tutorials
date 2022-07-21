
// @ts-nocheck
'use strict';
// Public API
module.exports.publicEndpoint = (_event, _context, cb) => {
  cb(null, { message: 'Welcome to our Public API!' });
};

// Private API
module.exports.privateEndpoint = (_event, _context, cb) => {
  cb(null, { message: 'Only logged in users can see this' });
};