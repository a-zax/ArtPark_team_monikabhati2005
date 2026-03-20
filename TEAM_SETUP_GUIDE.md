# CogniSync AI — Teammate Setup Guide

Welcome! If you're reading this, you're about to run our Hackathon project, **CogniSync AI**, on your own computer.

This guide is written step-by-step so you can get the application running in **under 10 minutes** — no prior coding experience required.

---

## What You'll Need

Before we start, make sure you have the following ready:

1. **The project files** (ZIP or cloned from GitHub)
2. **A Groq API Key** — free, no credit card required (instructions below)
3. **An internet connection** for the first install only

---

## Step 1: Get Your Free AI API Key

CogniSync AI uses **Groq Cloud** (free tier) to run the Llama 3.3 AI model. You need an API key for the AI features to work.

1. Go to: **[https://console.groq.com](https://console.groq.com)**
2. Click **"Sign Up"** (or **"Log In"** if you already have an account) — you can sign in with Google
3. Once logged in, click **"API Keys"** in the left sidebar
4. Click **"Create API Key"**, give it any name (e.g., `hackathon`), and click **Create**
5. **Copy the key immediately** — it starts with `gsk_...` and looks like a long random string
6. Store it somewhere safe (like a notepad) — you'll need it in Step 4

> **Why is this needed?** The AI brain of our app (Llama 3.3 70B by Meta) runs on Groq's servers. Without the key, the app can still load and display the UI, but the "Formulate Pathway" button won't be able to generate results.

---

## Step 2: Install Node.js

Our project runs on **Node.js**. Your computer needs this installed first.

1. Go to: **[https://nodejs.org](https://nodejs.org/)**
2. Click the big green **"LTS"** button (Recommended for Most Users)
3. Download and run the installer — click **Next** through all default settings
4. After it finishes, **restart your computer** (or fully close all terminal windows) so your computer recognizes the new software

**To verify it worked:** Open a new terminal and type `node -v` — you should see a version number like `v20.x.x`

---

## Step 3: Get the Project Files

If you haven't already, get the project onto your computer:

- **Option A (GitHub):** `git clone <repository-url>`
- **Option B (ZIP):** Download the ZIP file, right-click → **Extract All**, place in an easy location like your Desktop

Open the extracted folder — you should see files like `package.json`, `README.md`, `.env.example`, etc.

---

## Step 4: Configure the Environment File

This is where you tell the app your secret API key.

1. Find the file called **`.env.example`** in the project root folder
2. **Duplicate it** and rename the copy to exactly **`.env.local`** (note the dot at the start)
   - On Windows: Right-click → Copy → Paste → Rename to `.env.local`
3. Open **`.env.local`** with any text editor (Notepad, VS Code, etc.)
4. You'll see a line like:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Replace `your_groq_api_key_here` with the key you copied in Step 1:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. Save the file

> **Security Note:** The `.env.local` file is automatically excluded from Git. Never share this file or commit it to GitHub.

---

## Step 5: Open the Terminal Inside the Project Folder

### On Windows:
1. Open the project folder in File Explorer
2. Click on the address bar at the top (where it shows the folder path)
3. Delete the text, type **`cmd`**, and press **Enter**
4. A black Command Prompt window will open — it's now inside the project folder!

### On Mac / Linux:
1. Open the Terminal application
2. Type `cd ` (with a space), then drag and drop the project folder into the terminal window
3. Press **Enter**

---

## Step 6: Install & Run

In the terminal window, run the following two commands in order:

### Install dependencies (one-time only):
```bash
npm install
```
Wait 1-3 minutes while it downloads the required libraries. You'll see a loading progress bar.

### Start the application:
```bash
npm run dev
```
Wait about 5-10 seconds. You'll see output like:
```
✓ Ready in 2s
- Local: http://localhost:3000
```

---

## Step 7: Open the Application

1. Open your web browser (Chrome, Edge, or Firefox recommended)
2. In the address bar, type: **`http://localhost:3000`**
3. Press **Enter**

🎉 **You're done!** CogniSync AI should now be running with the full cinematic experience.

---

## How to Use the App

1. **Homepage** — Explore the Features, How it Works, and the live Demo animation
2. **Start Onboarding / Upload** — Click any CTA button to go to the upload page
3. **Upload a Resume** — Drag and drop a `.pdf`, `.docx`, or `.txt` file into the left zone
4. **Paste a Job Description** — Copy a job posting from LinkedIn/company site and paste into the right box
5. **Formulate Pathway** — Click the big white button and wait ~10-15 seconds for the AI to process
6. **Explore Your Roadmap** — The page will auto-scroll to your personalized pathway
   - Click **"Test Knowledge"** on any module to take an AI-generated quiz
   - Check your **Competency Radar Chart** for a visual gap snapshot
   - Download your **Calendar Schedule** as a `.ics` file

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `GROQ_API_KEY is not set` error | Make sure `.env.local` exists and has the correct key (not `.env.example`) |
| `npm install` fails | Make sure Node.js 18+ is installed: run `node -v` to check |
| Page shows but AI doesn't work | Double-check your Groq API key is valid and hasn't expired |
| Port 3000 already in use | Stop any other running dev servers, or run `npm run dev -- -p 3001` |
| Build error about `icon.svg` | This is a known harmless warning — the app will still run fine |

---

## Shutting Down

When you're done testing, return to your terminal window and press **`Ctrl + C`** to stop the server.

---

## Docker Alternative (Advanced)

If you have Docker Desktop installed, you can run the app without installing Node.js:

```bash
docker build -t cognisync-ai .
docker run -p 3000:3000 -e GROQ_API_KEY=your_key_here cognisync-ai
```

Then visit `http://localhost:3000`.

---

*Built with precision and ambition for the ArtPark CodeForge Hackathon 2026.*
*© 2026 CogniSync AI Team*
