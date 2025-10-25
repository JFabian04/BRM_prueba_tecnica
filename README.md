# Inventory API

A RESTful API for managing a product inventory system, built with Node.js, Express, and Sequelize.

## Features

*   **User Authentication:** JWT-based authentication with roles (admin, client).
*   **Product Management:** Full CRUD operations for products.
*   **Category Management:** Assign categories to products.
*   **Image Uploads:** Support for multiple image uploads for each product.
*   **Purchase Management:** Logic for handling product purchases.
*   **Dockerized:** Fully containerized with Docker and Docker Compose for easy setup and deployment.
*   **API Documentation:** API documentation generated with `apidoc`.

## Technologies

*   **Backend:** Node.js, Express.js
*   **Database:** MySQL
*   **ORM:** Sequelize
*   **Authentication:** JSON Web Tokens (JWT)
*   **Image Uploads:** Multer
*   **Containerization:** Docker, Docker Compose
*   **API Documentation:** `apidoc`

## Prerequisites

*   Node.js (v18 or higher)
*   NPM
*   Docker
*   Docker Compose

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd inventory-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables:

    ```env
    # Server Configuration
    NODE_ENV=development
    PORT=3000

    # Database Configuration
    DB_HOST=localhost
    DB_PORT=3306
    DB_NAME=inventory_db
    DB_USER=inventory_user
    DB_PASSWORD=inventory_pass

    # JWT Configuration
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=24h

    # Polling for nodemon in Docker
    CHOKIDAR_USEPOLLING=true
    CHOKIDAR_INTERVAL=1000
    STATIC_URL: "http://localhost:3000/uploads/"
    ```

## Running the Application

### With Docker (Recommended)

This is the easiest way to get the application and the database running.

1.  **Build and start the containers:**
    ```bash
    docker-compose up --build
    ```
    The API will be available at `http://localhost:3000`.

### Without Docker

1.  **Start the database:**
    Make sure you have a MySQL instance running and that the database `inventory_db` exists.

2.  **Run the database migrations:**
    The application uses Sequelize's `sync` method to create the tables. The `init.sql` file is used for the Docker setup.

3.  **Start the application:**
    ```bash
    npm start
    ```
    Or for development with auto-reloading:
    ```bash
    npm run dev
    ```

## API Documentation

The API documentation is generated from the source code using `apidoc`.

*   **To generate the documentation:**
    ```bash
    npm run doc
    ```
    This will create the documentation in the `docs/` directory.

*   **To view the documentation:**
    Once the application is running, you can access the documentation at `http://localhost:3000/api/docs`.

## Available Scripts

*   `npm start`: Starts the application.
*   `npm run dev`: Starts the application in development mode with `nodemon`.
*   `npm run doc`: Generates the API documentation.
