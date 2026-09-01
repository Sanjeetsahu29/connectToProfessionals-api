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
