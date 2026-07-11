# Vercel Microservices

This repository contains multiple Vercel microservices. Each microservice is independent and can be run or deployed separately.

---

# Prerequisites

Before getting started, ensure you have the following installed:

- Node.js (v18 or later recommended)
- npm
- Git
- Vercel CLI

Install the Vercel CLI globally:

```bash
npm install -g vercel
```

Login to your Vercel account:

```bash
vercel login
```

---

# Running a Microservice Locally

Navigate to the desired microservice.

Example:

```bash
cd auth-module
```

Install dependencies:

```bash
npm install
```

Start the local Vercel development server:

```bash
vercel dev
```

Repeat the same steps for any other microservice.

Example:

```bash
cd product-module
vercel dev
```

---

# Deploying a Microservice to Vercel

## Step 1: Push Your Code to Git

Initialize Git (if not already initialized):

```bash
git init
```

Add all files:

```bash
git add .
```

Commit your changes:

```bash
git commit -m "Initial commit"
```

Create a repository on GitHub, GitLab, or Bitbucket, then connect your local repository.

Example (GitHub):

```bash
git remote add origin https://github.com/your-username/your-repository.git
```

Push your code:

```bash
git branch -M main
git push -u origin main
```

---

## Step 2: Import the Repository into Vercel

1. Open the **Vercel Dashboard**.
2. Click **Add New Project**.
3. Import your GitHub/GitLab/Bitbucket repository.
4. Authorize Vercel to access your Git provider if prompted.
5. Select the repository.

---

## Step 3: Configure the Project

While importing:

- **Root Directory:** Select the microservice folder (e.g. `auth-module`).
- **Framework Preset:** Leave as detected or choose **Other** if required.
- **Build Command:** Leave default unless your project requires a custom command.
- **Output Directory:** Leave default.
- Add any required Environment Variables.

Click **Deploy**.

---

## Step 4: Automatic Deployments

Once connected to Git:

- Every push to the **main** branch automatically deploys to Production.
- Every pull request or feature branch creates a Preview Deployment.

No manual deployment is required after the initial setup.

---

# Manual Deployment Using Vercel CLI (Optional)

Navigate to the microservice:

```bash
cd auth-module
```

Deploy:

```bash
vercel
```

Deploy directly to production:

```bash
vercel --prod
```

---

# Pull Environment Variables

If your project uses Vercel Environment Variables:

```bash
vercel env pull
```

---

# Useful Commands

### Start Local Development

```bash
vercel dev
```

### Preview Deployment

```bash
vercel
```

### Production Deployment

```bash
vercel --prod
```

### Pull Environment Variables

```bash
vercel env pull
```

### View Deployment Logs

```bash
vercel logs
```

---

# Example Project Structure

```
project-root/
│
├── auth-module/
├── user-module/
├── product-module/
├── order-module/
└── README.md
```

Each folder is deployed as an independent Vercel project.

---

# Notes

- Always run commands from inside the respective microservice directory.
- Configure the **Root Directory** correctly when importing the project into Vercel.
- Ensure all required environment variables are added before deployment.
- After connecting the repository, Vercel automatically redeploys whenever new commits are pushed to the configured branch.