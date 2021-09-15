'use strict';

const express = require('express');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/asyncHandler');
const { authenticateUser } = require('./middleware/authenticateUser');

// Construct a router instance
const router = express.Router();

// Return all properties and values for the currently authenticated User
router.get('/users', authenticateUser , asyncHandler( async (req, res) => {
  const user = req.currentUser;
  
  // Send a 200 HTTP status code on success
  res.status(200).json( { 
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddress
   } );
}))

// Create a new user
router.post('/users', asyncHandler( async (req, res) => {
  
  // Set the Location header to "/"

  // Return a 201 HTTP status code and no content
  res.status(201).end();
}))

module.exports = router;