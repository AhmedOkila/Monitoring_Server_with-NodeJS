# Monitoring Server
Uptime monitoring RESTful API server that allows authenticated users to monitor URLs, and get detailed uptime reports about their availability, average response time, and total uptime/downtime.

## Setup
### Inside the Project Root Directory
  - Run `npm install`
  - Create a new database on MongoDB 
  - Create `.env` With these Environmental Variables
    1. DATABASE
    2. PORT
    3. ADMIN_MAIL
    4. ADMIN_PASSWORD 
    5. SECRET_KEY
  - Run `npm start`
## API endpoints

* Authentication
    - (PUT) `/auth/signup` to sign up using your email and password
    - (POST) `/auth/login` to login and get a response with the `JWToken` 
    - (POST) `/auth/verify` to verify your email by the code sent to your email

* CRUD operations on the URLChecks
    - (GET) `/service/checks` to get all of your checks
    - (GET) `/service/checks/:checkId` to get a specific check
    - (POST) `/service/checks` to create a check
    - (PUT) `/service/checks/:checkId` to update a check of yours
    - (DELETE) `/service/checks/:checkId` to delete a check of yours

* CRUD operations on the Reports
    - (GET) `/service/reports/:checkId` to get all of your reports
    - (POST) `/service/reports` to get all of your reports having the required tag
