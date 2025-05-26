# AI Husband Web App Deployment Guide

This guide will walk you through deploying the AI Husband application to Vercel and setting up the GitHub repository.

## Prerequisites
- A GitHub account
- A Vercel account (free tier is sufficient)
- Node.js and npm installed on your machine

## Step 1: Prepare the GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account.
2. Click the "+" icon in the top-right corner and select "New repository".
3. Name your repository "aihusband".
4. Add a description: "AI Husband web application where users can customize and chat with an AI husband".
5. Choose "Public" visibility.
6. Check "Add a README file".
7. Click "Create repository".

## Step 2: Clone the Repository Locally

```bash
git clone https://github.com/yourusername/aihusband.git
cd aihusband
```

## Step 3: Add Your Project Files

1. Copy all files from your development directory to the cloned repository.
2. Create a `.gitignore` file with the following content:

```
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# production
build/
dist/

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

3. Initialize and push your code:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

## Step 4: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account.
2. Click "New Project".
3. Import your "aihusband" repository.
4. Configure the project:
   - Framework Preset: React
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: build
5. Add environment variables if needed.
6. Click "Deploy".

## Step 5: Deploy Backend to Vercel

1. In your Vercel dashboard, click "New Project" again.
2. Import the same "aihusband" repository.
3. Configure the project:
   - Framework Preset: Node.js
   - Root Directory: backend
   - Build Command: npm install
   - Output Directory: (leave empty)
   - Install Command: npm install
4. Add the following environment variables:
   - MONGODB_URI: Your MongoDB Atlas connection string
   - PORT: 8080 (Vercel will override this)
   - GROK_API_KEY: Your xAI Grok API key
5. Click "Deploy".

## Step 6: Configure Domain Settings

### Custom Domain Setup

1. In your Vercel dashboard, select your frontend project.
2. Go to "Settings" > "Domains".
3. Add your domain: "aihusband.com".
4. Follow Vercel's instructions to configure your DNS settings:
   - Add an A record pointing to Vercel's IP address
   - Add a CNAME record for the "www" subdomain

### API URL Configuration

1. Get the deployment URL of your backend project from Vercel.
2. In your frontend project, go to "Settings" > "Environment Variables".
3. Add a new variable:
   - Name: REACT_APP_API_URL
   - Value: Your backend deployment URL (e.g., https://aihusband-backend.vercel.app/api)
4. Click "Save".
5. Redeploy your frontend project for the changes to take effect.

## Step 7: Update API Service in Frontend

Create a new file in your frontend project called `.env.production` with the following content:

```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

Replace `your-backend-url.vercel.app` with your actual backend deployment URL.

## Step 8: Test Live Deployment

1. Visit your deployed frontend application (aihusband.com).
2. Test all functionality:
   - Customization form
   - Chat interface
   - Data export
   - Static pages (Privacy Policy, Terms of Service)
3. Verify mobile responsiveness.

## Troubleshooting

If you encounter issues with the deployment:

1. Check Vercel's deployment logs for errors.
2. Verify that all environment variables are correctly set.
3. Ensure your MongoDB Atlas connection is properly configured.
4. Check CORS settings in your backend code if API requests are failing.

For additional help, refer to the [Vercel documentation](https://vercel.com/docs).
