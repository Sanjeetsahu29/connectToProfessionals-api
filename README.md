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
