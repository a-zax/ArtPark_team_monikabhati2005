# SyncPath AI - Teammate Setup Guide

Welcome! If you are reading this, you are about to run our Hackathon project, **SyncPath AI**, on your own computer. 

Don't worry if you don't have a technical background—this guide is written step-by-step so you can get the application running in under 5 minutes.

---

## Step 1: Install Node.js (The Engine)
Our project runs on a technology called Node.js. Your computer needs this installed first.

1. Go to the official Node.js website: [https://nodejs.org](https://nodejs.org/)
2. Click the big green button that says **"LTS" (Recommended for Most Users)**. This will download an installer file.
3. Open the downloaded installer and click **Next** through all the default settings until it finishes.
4. **Important**: After it installs, you must **restart your computer** (or fully close all open terminal windows) so your computer recognizes the new software.

---

## Step 2: Get the Project Files
If you haven't already, you need the actual project codebase on your computer.

1. Download the project folder (either via Google Drive, a ZIP file sent from your teammate, or from GitHub).
2. If it's a ZIP file, **extract (unzip)** it to an easy-to-find location, like your Desktop.
3. Open the extracted folder so you can see all the project files (like `package.json`, `README.md`, etc.).

---

## Step 3: Open the Terminal
We need to type exactly two commands to start the project. 

### On Windows:
1. Open the project folder in File Explorer.
2. Click on the address bar at the very top of the window (where it says `C:\Users\...\Desktop` or similar).
3. Delete everything in the bar, type `cmd`, and press **Enter**.
4. A black command prompt window will pop up. It is now open directly inside your project folder!

### On Mac:
1. Open the project folder in Finder.
2. Right-click the folder and select **New Terminal at Folder** (or open the "Terminal" app, type `cd `, and drag the folder into the Terminal).

---

## Step 4: Install & Run!
In that black command window you just opened, do the following:

1. **Install the project dependencies**: 
   Type the exact command below and press **Enter**:
   ```cmd
   npm install
   ```
   *(Wait a minute or two while it downloads the required code libraries. You will see a loading bar.)*

2. **Start the application**:
   Once the installation is completely done, type this command and press **Enter**:
   ```cmd
   npm run dev
   ```
   *(Wait a few seconds. You will see a message saying "Ready" and something about "http://localhost:3000".)*

---

## Step 5: View the Application
1. Open your web browser (Chrome, Edge, Safari, etc.).
2. In the URL address bar at the top, type exactly:
   **`http://localhost:3000`**
3. Press **Enter**.

**You are done!** The SyncPath AI Onboarding Engine should now be running beautifully on your screen. You can upload resumes, view the interactive reasoning traces, and test clicking around exactly like a real user!

> **Note:** To shut down the application when you are finished testing, just close the black command window, or click inside it and press **Ctrl + C**.
