# ConnectToProfessional Backend:

Understanding Every step, Why it matters, and the Engineering thought process

<img width="2752" height="1536" alt="Gemini_Generated_Image_5edyhl5edyhl5edy" src="https://github.com/user-attachments/assets/e845961f-b76c-40fd-a1f8-7bed9f3754eb" />

## Project Planning

High Level Design, Level Level Design and Planning of ConnectToProfessional Project

Below is the list of all feature that this project holds

- Create an account
- Login into the account
- Update the profile
- Feed Page - To explore the other professional to ignore and show interest
- Send connection Request
- See our matches i.e. our connection [ which is in accepted state either from my side or sender side ]

**Tech Planning**
This project will be having two microservices

1. Frontend ( React )
2. Backend ( Node.js, express and MongoDB )

**Low Level Design of the Project**

Database Schema Design

1. User schema (First name, Last name, email address, password, age, gender, skills, about, professional experiences, interest, hobby)
2. ConnectionRequest schema (from User Id, to User Id, status - [ interested, ignored, accepted, rejected ]

### API List of the project

1. auth Router
   - POST /signup
   - POST /login
   - POST /logout
2. profile Router
   - GET /profile/view
   - PATCH /profile/edit
   - PATCH /profile/password
3. connection Request Router
   - POST /request/send/:status/:userID
   - POST /request/review/:status/:requestID
4. user Router
   - GET /user/request/received
   - GET /user/connections
   - GET /user/feed - Gets you the profiles of other users on platform

<hr>

## Setting up the Basic server and Database connection

1. Initialize the git repository to track all the progress of the project and add a .gitignore file to avoid pushing unnecessary files or sensitive files to the GitHub repo.
2. Initialize the Node.js project using the command `npm init` to generate a package.json file, which manages the dependencies, project metadata, and build scripts.
3. Install express by typing `npm i express` to handle routing, middleware, and HTTP server creation.
4. Install development tool like nodemon for automatic server restart upon making any code changes
5. Configure package.json script to start the server
   ```
   "script":{
       "start": "node src/app.js",
       "dev"  : "nodemon src/app.js"
   }
   ```
6. Create Basic Server Entry point to get started building the project

   ```jsx
   const express = require("express");
   const app = express();
   const PORT = process.env.PORT || 5000;

   // Middleware for parsing JSON bodies
   app.use(express.json());

   // Health check route
   app.get("/", (req, res) => {
     res.status(200).json({ message: "Server is running successfully" });
   });

   app.listen(PORT, () => {
     console.log(`Server listening on port ${PORT}`);
   });
   ```

   <aside>
   💡

   **app.use( express.json() ) is a built-in middleware function in Express that automatically parses incoming requests with a JSON payload**.

   By default, Node.js and Express treat request bodies as raw streams of data. Without this middleware, if a client sends a JSON payload to your server, the **`req.body` property will return `undefined`**. This single line of code catches those streams, converts the raw JSON string into a native JavaScript object, and populates `req.body` so you can immediately interact with the data.

   </aside>

<hr>

## Connecting to the database

Once the basic server is setup and start responding to request it recieve then it become necessary to setup the database connection for data to persist and perform the operation on the data.

Get the connection URI from the mongoDB database after the setting up the free tier cluster.

Since our backend or node.js can’t communicate to the database directly therefore we need the medium to be able to communicate with database. And depending on the database type we need a tool like ORM (Object Relational Mapping ) for relational database and ODM (Object Document Mapping ) for mongoDB database.

Mongoose is one of ODM. Therefore I would be using mongoose in my backend to communicate with database and perform required actions. To install mongoose type `npm i mongoose`

For connecting to database we don’t write the logic in the app.js rather I would make a separate folder or directory with name ‘config’ and then under this folder I would create a file name database.js for writing the logic to connect to the database.

```
const mongoose = require('mongoose')
const connectDB = async () => {
    await mongoose.connect('connectionUri')
}
module.exports = connectDB;
```

Now this piece of code is modular and provide a better control flow. Using this I can import it my app.js main backend file where I can implement a logic to first connect to database and upon successful connection I will start the server else not.

```
const express = require("express");
const connectDB  = require("./config/database");
const app = express();
const port = 3000;

connectDB()
		.then ( () => {
			app.listen(port, ()=>{
				console.log("Connected to database and Server is listening on port: "+port)
				}
		 )
		.catch(err){
				console.log("Database connection failed and server is not available")
		}
```

<hr>

## Writing User Schema using mongoose ODM (Object Document Mapper )

A schema defines the structure and rules for documents that will be stored in a MongoDB collection.

When building a backend application, we need to define what information a User document should contain. The Mongoose schema provides a structured way to describe:

Which fields a user can have
The data type of each field
Which fields are required
Which fields must be unique
Additional validation and behavior

For example, a user can have fields such as:

- firstName
- lastName
- email
- password
- age
- gender
- about
- skills
- interest
  Mongoose uses this schema as the application's data model when interacting with MongoDB.

#### Creating a User Schema

First, import Mongoose

```
const mongoose = require("mongoose");
```

Then create the schema using mongoose.Schema():

```
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
  },

  gender: {
    type: String,
  },
});
```

#### Understanding Each Field

`firstName`

```
firstName: {
  type: String,
  required: true,
}
```

- **type**: String → The value must be a string.
- **required**: true → The field must be provided when creating a user.

`lastName`

```
lastName: {
  type: String,
  required: true,
}
```

The user's last name is also required and must be a string.

`email`

```
email: {
  type: String,
  required: true,
  unique: true,
}
```

The email field has three important properties:

- **String** → Email is stored as a string.
- **required**: true → Every user must provide an email.
- **unique**: true → The email should be unique among users.
For example, two users should not normally have the same email address.
<blockquote>
unique: true is primarily an instruction for creating a unique MongoDB index; it is not a complete application-level validation mechanism. Your API should still handle duplicate-key errors properly.
</blockquote>

`password`

```
password: {
  type: String,
  required: true,
}
```

The password is required and stored as a string.

In a real application, never store the user's plain-text password. The password should be hashed before being stored in MongoDB.

`age`

```
age: {
  type: Number,
}
```

The age field is optional because required: true has not been specified.

You can also add validation rules later, for example

```
age: {
  type: Number,
  min: 18,
  max: 100,
}
```

`gender`

```
gender: {
  type: String,
}
```

The gender field is optional and must contain a string.

For production applications, you may want to restrict the allowed values rather than accepting arbitrary strings.

```
gender: {
  type: String,
  enum: ["male", "female", "other"],
}
```

#### Schema vs. Document

It is important to understand the difference between a schema and a document.

`Schema`
The schema defines the expected structure:

```
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
});
```

Think of it as a blueprint.

`Document`
A document is an actual piece of data stored in MongoDB:

```
{
  "_id": "68...",
  "firstName": "Sanjeet",
  "lastName": "Kumar",
  "email": "sanjeet@example.com"
}
```

Think of the document as an actual object created using that blueprint.

#### Creating a Mongoose Model

After defining the schema, create a model

```
const User = mongoose.model("User", userSchema);
```

The model provides the interface through which your application interacts with MongoDB.

For example:

```
const user = new User({
  firstName: "Sanjeet",
  lastName: "Kumar",
  email: "sanjeet@example.com",
  password: "hashedPassword",
  age: 25,
  gender: "male",
});
await user.save();
```

#### Exporting the Model

Finally, export the model

```
module.exports = User;
```

This allows other files in the application to import and use the User model.

For example:

```
const User = require("./models/user");
```

The model can then be used inside controllers, route handlers, services, etc.

### Complete User Schema

A cleaner version of the current schema would be

```
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
  },

  gender: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
```

#### Mental Model

```
Schema
   ↓
Defines document structure
   ↓
Model
   ↓
Provides database operations
   ↓
MongoDB Collection
   ↓
User Documents
```

The important distinction is: MongoDB stores documents; Mongoose schemas define the application's expected structure for those documents; Mongoose models provide the API used by your Node.js application to work with them.
