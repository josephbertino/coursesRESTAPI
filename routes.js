'use strict';

const express = require('express');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/asyncHandler');
const { authenticateUser } = require('./middleware/authenticateUser');

// Construct a router instance
const router = express.Router();

// Setup the router to expect JSON as input
router.use(express.json());

// GET:: Return all public properties and values for the currently authenticated User
router.get('/users', authenticateUser, asyncHandler( async (req, res) => {
  const user = req.currentUser;
  
  // Send a 200 HTTP status code on success
  res.status(200).json( { 
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    username: user.emailAddress
   } );
}))

// POST:: Create a new user
router.post('/users', asyncHandler( async (req, res) => {
  // Sequelize will perform validation on the User we are trying to create
  // and throw an error if something is off
  await User.create(req.body);

  // Set the Location header to "/" and
  // Return a 201 HTTP status code and no content
  res.status(201).setHeader('Location','/').end();
}))

// GET:: Get all courses including the User associated with each course
router.get('/courses', asyncHandler( async (req,res) => {
  const courses = await Course.findAll({
    include: [
      {
        // Get the User-owner data as well
        model: User,
        attributes: [
          'firstName', 'lastName', 'emailAddress'
        ]
      }
    ]
  })

  // Return a 200 HTTP Status, and all the course data
  res.status(200).json(courses)
}));

// GET:: Get the course with given ID, and include the associated User
router.get('/courses/:id', asyncHandler( async(req,res)=>{
  const course = await Course.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
        // Get the User-owner data as well
        model: User,
        attributes: [
          'firstName', 'lastName', 'emailAddress'
        ]
      }
    ]
  })

  if (course) { 
    // Return 200 for Success
    res.status(200).json(course);
  } else {
    // Requested resource (course with ID) did not exist, so return 404 error
    const error = new Error(`Course with id ${req.params.id} does not exist`);
    error.status = 404;
    throw error;
  }
}))

// POST:: Create a new course. First authenticate the user making the POST request
router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {
  const course = await Course.create(req.body);
  // set the Location header to the URI for the newly created course
  // and return a 201 HTTP status code and no content.
  res.status(201).setHeader('Location',`/api/courses/${course.id}`).end();
}))

// PUT:: Update the course with the given ID. First authenticate the user making the PUT request
router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  const user = req.currentUser;

  let course = await Course.findOne( {
    where : {
      id: req.params.id
    }
  });

  let message;

  if (course) {
    if (course.userId == user.id) {
      // If the authenticating user is the owner of this Course,
      // Validate the changes and update the record
      // Note that even if the req.body tries to change the primary key `id`, it will not change!
      await course.update(req.body)
      
      // Return 204 status with no content
      res.status(204).end();
    } else {
      message = `Only the owner of this Course (userId: ${course.userId}) may modify this Course`
    }
  } 
  else {
    message = `Course with id ${req.params.id} does not exist`
  }

  if (message) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
}));

// DELETE:: Delete the corresponding course after authenticating the user
router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res)=> {
  const currentUser = req.currentUser;
  
  // Does the course with this ID exist?
  let course = await Course.findOne( {
    where : {
      id: req.params.id
    }
  })

  let message;

  if (course) {
    if (course.userId == currentUser.id) {
      // If the authenticating user is the owner of this Course,
      // Delete the course and return a 204 HTTP status and no content
      await course.destroy();
      res.status(204).end();
    } else {
      message = `Only the owner of this Course (userId: ${course.userId}) may modify this Course`
    }
  } else {
    message = `Course with id ${req.params.id} does not exist`;
  }

  if (message) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
}))

module.exports = router;