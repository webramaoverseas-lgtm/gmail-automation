# Gmail Automation Project Startup Guide

This project consists of a Node.js backend and a React frontend built with Vite.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **MongoDB**: The project requires a MongoDB connection (already configured in `.env`).
- **Dependencies**: You need to install packages for both the backend and frontend.

## Step-by-Step Instructions

### 1. Install Dependencies
Open your terminal in the project root and run:
```powershell
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables
The `.env` file in the root directory is already set up with:
- `GMAIL_USER`
- `EMAIL_PASS`
- `MONGO_URI`

> [!IMPORTANT]
> The backend code references a `GMAIL_BRIDGE_URL`. If you are sending emails, ensure this is set in your environment or added to the `.env` file.

### 3. Start the Backend
From the root directory, run:
```powershell
node server.js
```
The backend will start on [http://localhost:5000](http://localhost:5000).

### 4. Start the Frontend
Open a new terminal window/tab, navigate to the `frontend` directory, and run:
```powershell
cd frontend
npm run dev
```
The frontend will be available at [http://localhost:5173](http://localhost:5173).

## Project Features
- **Upload Contacts**: CSV/XLSX support.
- **Email Campaigns**: Automated outreach and follow-ups.
- **Analytics**: Track sent emails and replies.
- **Template Management**: Customize your email content.
