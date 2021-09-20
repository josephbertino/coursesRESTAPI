'use strict';

const express = require('express');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/asyncHandler');
const { authenticateUser } = require('./middleware/authenticateUser');

// Construct a router instance
const router = express.Router();

// Expect JSON as input
router.use(express.json());

// Return all properties and values for the currently authenticated User
router.get('/users', authenticateUser, asyncHandler( async (req, res) => {
  const user = req.currentUser;
  
  // Send a 200 HTTP status code on success
  res.status(200).json( { 
    name: `${user.firstName} ${user.lastName}`,
    username: user.emailAddress
   } );
}))

// Create a new user
router.post('/users', asyncHandler( async (req, res) => {
  await User.create(req.body);

  // Set the Location header to "/" and
  // Return a 201 HTTP status code and no content
  res.status(201).setHeader('Location','/').end();
}))

// Get all courses including the User associated with each course and a 200 HTTP status code.
router.get('/courses', asyncHandler( async (req,res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User,
        attributes: [
          'firstName', 'lastName', 'emailAddress'
        ]
      }
    ]
  })

  res.status(200).json(courses)
}));

// Return the corresponding course including the User associated and a 200 HTTP status code
router.get('/courses/:id', asyncHandler( async(req,res)=>{
  const course = await Course.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: User,
        attributes: [
          'firstName', 'lastName', 'emailAddress'
        ]
      }
    ]
  })

  if (course) { 
    res.status(200).json(course);
  } else {
    const error = new Error(`Course with id ${req.params.id} does not exist`);
    error.status = 404;
    throw error;
  }
}))

// Create a new course
router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {
  const course = await Course.create(req.body);
  // set the Location header to the URI for the newly created course
  // and return a 201 HTTP status code and no content.
  res.status(201).setHeader('Location',`/api/courses/${course.id}`).end();
}))

// Update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  let course = await Course.findOne( {
    where : {
      id: req.params.id
    }
  });

  if (course) {
    await course.update(req.body)

    // Return 204 status with no content
    res.status(204).end();
  } else {
    const error = new Error(`Course with id ${req.params.id} does not exist`);
    error.status = 400;
    throw error;
  };
}));

// Delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res)=> {
  let course = await Course.findOne( {
    where : {
      id: req.params.id
    }
  })

  if (course) {
    // Delete the course and return a 204 HTTP status and no content
    await course.destroy();
    res.status(204).end();
  } else {
    const error = new Error(`Course with id ${req.params.id} does not exist`);
    error.status = 400;
    throw error;
  }
}))

module.exports = router;