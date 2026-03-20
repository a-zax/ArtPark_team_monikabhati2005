# CogniSync AI Team Setup Guide

This guide is for a teammate who is not technical. Follow the steps in order and the project will run locally.

## What You Need

- project files on your computer
- internet for the initial install
- a free Groq API key
- Node.js installed

## Step 1: Get a Free Groq API Key

1. Open `https://console.groq.com`
2. Sign in with Google or create an account
3. Open the `API Keys` section
4. Click `Create API Key`
5. Copy the key that starts with `gsk_`

Keep that key safe. You will paste it into a local file in Step 4.

## Step 2: Install Node.js

1. Open `https://nodejs.org`
2. Download the `LTS` version
3. Run the installer with default options
4. Restart your terminal after installation

To confirm installation, open a terminal and run:

```bash
node -v
```

If you see a version number, Node.js is installed correctly.

## Step 3: Open the Project Folder

Make sure the project folder contains files like:

- `package.json`
- `README.md`
- `.env.example`

## Step 4: Create the Local Environment File

1. Find the file named `.env.example`
2. Copy it
3. Rename the copy to `.env.local`
4. Open `.env.local`
5. Replace the placeholder value with your real Groq key

It should look like this:

```bash
GROQ_API_KEY=gsk_your_real_key_here
```

Do not upload `.env.local` to GitHub.

## Step 5: Open a Terminal in the Project Folder

### Windows

1. Open the project folder in File Explorer
2. Click the address bar
3. Type `cmd`
4. Press Enter

### Mac or Linux

1. Open Terminal
2. Type `cd ` and drag the project folder into the terminal
3. Press Enter

## Step 6: Install Dependencies

Run:

```bash
npm install
```

Wait until it finishes.

## Step 7: Start the App

Run:

```bash
npm run dev
```

When the terminal says the app is ready, open:

```text
http://localhost:3000
```

## Step 8: How to Use the App

1. Open the homepage
2. Click the upload button
3. Upload a resume file in `PDF`, `DOCX`, or `TXT`
4. Paste a job description
5. Click `Formulate Pathway`
6. Review the generated skill profiles, roadmap, readiness score, radar chart, and quiz buttons

## If Something Goes Wrong

### `npm` is not recognized

Node.js is not installed correctly. Reinstall Node.js and reopen the terminal.

### The app opens but analysis does not work

Check that `.env.local` exists and contains a valid `GROQ_API_KEY`.

### Port 3000 is already in use

Stop the other local app using that port, then run the command again.

### Resume upload fails

Use one of these file types only:

- `.pdf`
- `.docx`
- `.txt`

Also make sure the file is below `5 MB`.

## Docker Option

If Docker Desktop is installed, you can also run:

```bash
docker build -t cognisync-ai .
docker run -p 3000:3000 -e GROQ_API_KEY=your_groq_api_key_here cognisync-ai
```

Then open `http://localhost:3000`.

## Stopping the App

In the terminal where the app is running, press:

```bash
Ctrl + C
```
