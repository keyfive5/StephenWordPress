# Project Setup Guide

This project consists of three separate repositories:

- **Backend Microservices**
- **Frontend User (Next.js)**
- **Frontend Admin (Next.js)**

> **Important:** The backend microservices must be set up and deployed before running either of the frontend applications.

---

# Step 1: Setup the Backend Microservices

Before running the frontend applications, you must first set up and deploy all backend microservices.

Please follow the instructions in the Backend README:

```text
/microservices/README.md
```

The backend README explains how to:

- Install project dependencies
- Run each microservice locally
- Deploy each microservice to Vercel
- Configure environment variables
- Connect the project to GitHub
- Enable automatic deployments

Complete the backend setup and deployment before proceeding to the frontend projects.

---

# Step 2: Update Frontend Environment Variables

After deploying all backend microservices, copy the deployed URL of each service.

Update the `.env` files in **both** frontend repositories with the deployed microservice URLs.

Repositories:

```text
front-end-admin-nextjs
```

Update the following environment variables:

```env
Products_URL=https://your-products-service.vercel.app
Cat_URL=https://your-category-service.vercel.app
Auth_URL=https://your-auth-service.vercel.app
```

Replace the example URLs with the actual URLs of your deployed microservices before running or deploying the frontend applications.

# Step 3: Setup the Frontend Applications

Once the environment variables have been updated, follow the README of each frontend project.

User Frontend:

```text
/front-end-user-nextjs/README.md
```

Admin Frontend:

```text
/front-end-admin-nextjs/README.md
```

Each README includes instructions for:

- Installing dependencies
- Running the application locally
- Building the project
- Deploying the application

---

# Admin Access

The Admin Dashboard is accessible only to users with the **Admin** role.

Use the following test credentials to log in:

## Test Admin Credentials

**Email**

```text
admin@gmail.com
```

**Password**

```text
12345
```

---

# Setup Flow

```text
1. Setup Backend Microservices
        ↓
2. Deploy Backend Microservices to Vercel
        ↓
3. Copy the deployed Microservice URLs
        ↓
4. Update the `.env` file in both frontend repositories:
      • front-end-admin-nextjs
        ↓
5. Setup and Run the Next.js Frontend Applications
        ↓
6. Login to the Admin Dashboard using the provided Admin credentials
```

---

# Important Notes

- The frontend applications depend on the backend microservices and will not function correctly until the backend services are running or deployed.
- Whenever a backend service URL changes, update the corresponding environment variables in both frontend projects.
- Ensure all required environment variables are configured before deploying the backend or frontend applications.
- It is recommended to deploy all backend microservices before deploying either frontend application.