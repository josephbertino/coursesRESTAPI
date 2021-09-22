'use strict';

// 'basic-auth' is the library to read the Basic Authorization credentials
const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser =  async (req, res, next) => {
  
  let message; 

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  if (credentials) {
    // If the user's credentials are available,
    // Attempt to retrieve the user from the database by their username 
    const user = await User.findOne({
      where: {
        emailAddress: credentials.name
      }
    });
    if (user) {
      // If a user was successfully retrieved from the database,
      // use bcrypt to compare the password submitted from the Authorization header
      // to the user's password
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      if (authenticated) {
        // If the passwords match,
        // Store the retrieved user object on the request object
        // so any middleware functions that follow this authenticate middleware
        // will have access to the user's information.
        console.log(`Authentication successful for user with email address: ${user.emailAddress}`);
        
        // Store the user on the Request object
        req.currentUser = user;
      } else {
        // Passwords do not match
        message = `Authentication failure for user with email address: ${user.emailAddress}`;
      }
    } else {
      // No user
      message = `No user exists for email address: ${credentials.name}`;
    }
  } else {
    // No credentials
    message = `Auth header not found`;
  }
  
  // If user authentication failed,
  // return a response with a 401 Unauthorized HTTP status code.
  // (don't proceed to the next middleware)
  if (message) {
    console.warn(message);
    res.status(401).json({message: 'Access Denied'});
  } else {
    // Or if user authentication succeeded, 
    // Call the next() middleware function
    next();
  }
};