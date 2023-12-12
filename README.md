# FinalProject

# BackEnd
## Project Overview
- This Node.js project serves as the backend for an application that manages tasks and user authentication. 
- It uses Express for building the server, MongoDB for data storage, 
- Passport for user authentication, and JWT for token-based user sessions.

### Features:

- **User Authentication:** Utilizes Passport.js for local strategy authentication. Users can log in, register, and log out securely.

- **Tasks Management:** Allows users to perform CRUD operations on tasks, including adding, updating, and deleting tasks.

- **API Endpoints:** Provides API endpoints for retrieving tasks, retrieving specific tasks by ID, and managing tasks through HTTP methods.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/MykelAllan/FinalProject.git
    ```

2. **Navigate to the project directory:**
    ```bash
    cd your-node-project
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

4. **Set up MongoDB:**
    - Install MongoDB on your machine or use a cloud-based service.
    - Create a MongoDB database and update the connection URI in the code (`uri` variable).

5. **Run the server:**
    ```bash
    npm start
    ```
    The server will be accessible at [http://localhost:3000](http://localhost:3000).

## API Documentation

### Tasks API Endpoints:

- **GET /api/tasks:** Retrieve all tasks.
- **GET /api/tasks/:id:** Retrieve a specific task by ID.
- **POST /api/tasks/update/:id:** Update a task by ID.
- **GET /api/tasks/update/:id:** Retrieve a task for updating by ID.
- **DELETE /api/tasks/delete/:id:** Delete a task by ID.

### Identity Management Endpoints:

- **GET /login:** Render login page.
- **POST /login:** Handle login authentication.
- **GET /register:** Render registration page.
- **POST /register:** Handle user registration.
- **GET /logout:** Log out the user and clear session.

## Technologies Used:

- **Express:** Web framework for Node.js.
- **MongoDB:** NoSQL database for storing tasks and user data.
- **Passport:** Authentication middleware.
- **JWT (JSON Web Token):** Token-based authentication for user sessions.
- **Bcrypt:** Password hashing for secure storage.
- **EJS:** Templating engine for rendering views.
- **Cors:** Middleware for enabling Cross-Origin Resource Sharing.
- **dotenv:** Environment variable management.


# FrontEnd
## Project Overview

- This project is a simple React application featuring a homepage, shop page, and cart page. 
- Users can explore items on the shop page, add them to the cart, and manage their cart items. 
- The application utilizes React Router for navigation and local state for shopping cart management.
