# AI Husband Web Application

This repository contains the code for the AI Husband web application, where users can customize and chat with an AI husband.

## Features

- Customize your AI husband's name and personality (Romantic, Funny, Supportive)
- Optional user demographics (age, gender)
- Chat interface with AI responses
- Data export functionality
- Mobile-responsive design

## Technology Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas
- **Deployment**: Heroku

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- MongoDB Atlas account
- Heroku account

### Environment Variables

The application requires the following environment variables:

- `MONGODB_URI`: Your MongoDB connection string
- `GROK_API_KEY` (optional): API key for xAI's Grok API

### Local Development

1. Clone the repository
2. Install backend dependencies: `cd aihusband && npm install`
3. Install frontend dependencies: `cd client && npm install`
4. Create a `.env` file in the root directory with your MongoDB connection string
5. Run the backend: `npm run dev`
6. Run the frontend: `cd client && npm start`

### Deployment

This application is configured for easy deployment to Heroku with automatic GitHub integration.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please contact support@aihusband.com
