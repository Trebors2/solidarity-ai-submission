SOLIDARITY AI 2026 SUBMISSION SYSTEM
====================================

This package contains:

1. index.html
   The participant-facing form for GitHub Pages.

2. Code.gs
   The Google Apps Script backend. It saves submissions to:
   https://docs.google.com/spreadsheets/d/1wFax4EkVKfhHQPYCchRjohEZIQFllZmGEDwgxYI6a08/edit

3. appsscript.json
   Optional Apps Script manifest.

HOW TO INSTALL
==============

A. INSTALL THE GOOGLE APPS SCRIPT BACKEND

1. Open the Google Sheet:
   https://docs.google.com/spreadsheets/d/1wFax4EkVKfhHQPYCchRjohEZIQFllZmGEDwgxYI6a08/edit

2. In the Sheet, choose:
   Extensions > Apps Script

3. Delete any existing code in Code.gs.

4. Open the Code.gs file from this package and paste its entire contents into Apps Script.

5. Save the project.

6. In Apps Script, run the function:
   initializeSheet

7. Google will ask for authorization. Approve access to:
   - the Google Sheet
   - Google Drive, so uploaded papers can be stored

8. Click:
   Deploy > New deployment

9. Select:
   Type: Web app
   Execute as: Me
   Who has access: Anyone

10. Click Deploy.

11. Copy the Web App URL. It will look like:
    https://script.google.com/macros/s/XXXXXXXXXXXX/exec


B. CONNECT THE GITHUB FORM

1. Open index.html in a text editor.

2. Find this line near the bottom:
   const WEB_APP_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

3. Replace the placeholder with the Web App URL copied in step A.11.

4. Save index.html.

5. Upload the revised index.html to the root of your GitHub repository,
   replacing the earlier file.

6. Commit the change.

7. Wait one or two minutes for GitHub Pages to redeploy.


WHAT HAPPENS AFTER SUBMISSION
=============================

- Each response is appended to Sheet1 in the Google Sheet.
- The first row is created automatically with standardized headers.
- Each submission receives a unique ID.
- Uploaded final papers are stored in a Google Drive folder named:
  Solidarity AI 2026 Final Papers
- The paper's Drive URL is written into the spreadsheet.
- The participant receives an on-screen confirmation.


IMPORTANT LIMITS
================

- Maximum final-paper upload size: 8 MB.
- Accepted file types in the browser: PDF, DOC, DOCX.
- Panels are restricted to no more than four speakers.
- The form requires a clear explanation of the connection to Solidarity AI.


UPDATING THE BACKEND
====================

After editing Code.gs:

1. Deploy > Manage deployments
2. Select the current deployment
3. Click Edit
4. Choose New version
5. Deploy

The Web App URL normally remains the same.
