# coursesRESTAPI
### A RESTful API supporting the CRUD operations on a "School Course Database"

School is back in session! Simulate the role of a school administrator updating the Course curriculum with this useful, focused, RESTful API. Create and Update Users (teachers), and perform all 4 CRUD operations on the Course offerings. But be mindful of data security with user authentication---only registered Users may update or delete Course records from the syllabus, and one User may not retrieve the credentials of another.

User and Course tables are stored in an SQL database, which is manipulated by the API via Sequelize, the Promise-based Object Relational Mapping library in Node.js.

## Interacting with the API

The following routes are available via the RESTful API to perform CRUD operations on User and Course tables:

* `GET /api/users` : Authenticate yourself as a registered User and retrieve your user data from the database. But don't worry...we won't display your hashed password!

* `POST /api/users` : Add a new User to the SQL database. No login necessary, so this action may be performed by any school official with access to the API.

* `GET /api/courses` : Retrieve all posted Course records from the database. Each Course record also lists the User (teacher) associated with that Course. No login necessary, so this route is especially useful for current or incoming students!

* `GET /api/courses/:id` : Retrieve a single Course record from the database, including associated User information. No login necessary, so this route is especially useful for current or incoming students!

* `POST /api/courses` : As a registered User (must provide Basic Authorization credentials over the API), add a new Course to the database. You can even assign the Course to a User other than yourself.

* `PUT /api/courses/:id` : As a registered User (must supply Basic Authorization credentials over the API), update the details of a Course. Changing the Course's unique ID is not permitted, however, and attempts to update this value will be ignored by the API.

* `DELETE /api/courses/:id` : As a registered User (must supply Basic Authorization credentials over the API), delete a Course from the database. This operation cannot be undone!

## Bonus Functionality (Exceeding Expectations)

Our lead engineer has added some exciting new security and UX features to this Course Curriculum API!

* Data Validation: Users must register with unique email addresses (no duplicates in the system!), and email addresses must adhere to the format `<username>@<website-name>.<top-level-domain>`.
  * If a duplicate email is submitted when registering a new User, a `SequelizeUniqueConstraintError` is thrown and a 400 HTTP status code is returned.

* User Data Security: When retrieving your credentials as an authorized User via the route `GET /api/users`, the following fields are hidden:
  * password
  * createdAt
  * updatedAt

* Hide irrelevant Course information: When retrieving a list of Courses or a single Course with the API, the following fields are hidden:
  * createdAt
  * updatedAt

* Course Data Protection: Only the owner of a Course may update or delete that Course from the database (the User's unique ID must match the Course's userId field).