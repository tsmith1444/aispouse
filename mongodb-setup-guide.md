# MongoDB Setup Guide for AI Husband

This guide will walk you through setting up MongoDB Atlas for the AI Husband application.

## Prerequisites
- A MongoDB Atlas account (free tier is sufficient)
- Node.js and npm installed on your machine

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account if you don't have one.
2. After signing up and logging in, click "Build a Database".
3. Select the "FREE" tier option.
4. Choose your preferred cloud provider (AWS, Google Cloud, or Azure) and region closest to your users.
5. Click "Create Cluster" (this may take a few minutes to provision).

## Step 2: Set Up Database Access

1. In the left sidebar, click "Database Access" under the Security section.
2. Click "Add New Database User".
3. Create a username and password. Make sure to save these credentials securely.
4. Set privileges to "Read and Write to Any Database".
5. Click "Add User".

## Step 3: Configure Network Access

1. In the left sidebar, click "Network Access" under the Security section.
2. Click "Add IP Address".
3. For development, you can select "Allow Access from Anywhere" (0.0.0.0/0).
   - Note: For production, you should restrict this to specific IP addresses.
4. Click "Confirm".

## Step 4: Get Your Connection String

1. In the left sidebar, click "Database" under the Deployments section.
2. Click "Connect" on your cluster.
3. Select "Connect your application".
4. Copy the connection string.
5. Replace `<password>` with your database user's password and `<dbname>` with `aihusband`.

## Step 5: Configure the Application

1. Open the `.env` file in the backend directory of the AI Husband application.
2. Update the `MONGODB_URI` variable with your connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aihusband
   ```
3. Replace `<username>` and `<password>` with your MongoDB Atlas credentials.

## Step 6: Test the Connection

1. Start the backend server:
   ```
   cd backend
   npm start
   ```
2. If the connection is successful, you should see "Connected to MongoDB Atlas" in the console.

## Database Schema

The AI Husband application uses the following MongoDB schema:

### UserProfile Collection
```javascript
{
  userId: String,          // Unique identifier for the user
  age: String,             // User's age (optional)
  gender: String,          // User's gender (optional)
  husbandName: String,     // Name of the AI husband
  personality: String,     // Personality type (Romantic, Funny, Supportive)
  messages: [              // Array of message objects
    {
      user: String,        // User's message
      ai: String,          // AI's response
      timestamp: Date      // When the message was sent
    }
  ],
  sessionDuration: Number, // Duration of user's session in seconds
  createdAt: Date          // When the profile was created
}
```

## Data Export

The application provides a CSV export feature that allows you to download all user data for analysis. This data includes:
- User demographics (age, gender)
- AI husband customization (name, personality)
- Chat history
- Session duration

To access this data, use the "Export Data (CSV)" button in the application header when logged in.

## Troubleshooting

If you encounter connection issues:

1. Verify your MongoDB Atlas credentials are correct in the `.env` file.
2. Check that your IP address is allowed in the Network Access settings.
3. Ensure your MongoDB Atlas cluster is running.
4. Check the backend logs for specific error messages.

For additional help, refer to the [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/).
