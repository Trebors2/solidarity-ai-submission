const SPREADSHEET_ID = "1wFax4EkVKfhHQPYCchRjohEZIQFllZmGEDwgxYI6a08";
const SHEET_NAME = "Sheet1";
const UPLOAD_FOLDER_NAME = "Solidarity AI 2026 Final Papers";
const MAX_FILE_BYTES = 8 * 1024 * 1024;

const HEADERS = [
  "Timestamp","Submission ID","Name and affiliation","Email","Country or region",
  "Format","Proposed length","Title","Short program description","Full description",
  "Connection to Solidarity AI theme","Preferred audience size","Audience-size rationale",
  "Dialogue participants","Panelists","Panel count","Gender-balance explanation",
  "Workshop length","Workshop method","Exhibition description","Exhibition duration",
  "Exhibition space requirements","Number of presenters/facilitators","Session structure",
  "Other format description","Materials link","Technical/accessibility requirements",
  "Final paper filename","Final paper Drive URL","Source page"
];

function doGet() {
  return HtmlService.createHtmlOutput(
    "<h2>Solidarity AI submission endpoint</h2><p>This endpoint receives submissions from the conference form.</p>"
  );
}

function doPost(e) {
  try {
    if (!e || !e.parameter || !e.parameter.payload) {
      return responsePage(false, "", "No submission payload was received.");
    }

    const data = JSON.parse(e.parameter.payload);
    validateSubmission(data);

    const submissionId = Utilities.getUuid();
    const timestamp = new Date();
    let fileName = "";
    let fileUrl = "";

    if (data.finalPaper && data.finalPaper.base64) {
      const fileResult = saveUploadedFile(data.finalPaper, submissionId);
      fileName = fileResult.name;
      fileUrl = fileResult.url;
    }

    const sheet = getOrInitializeSheet();
    sheet.appendRow([
      timestamp,
      submissionId,
      clean(data.nameAffiliation),
      clean(data.email),
      clean(data.country),
      clean(data.format),
      clean(data.proposedLength || data.workshopLength),
      clean(data.title),
      clean(data.programText),
      clean(data.fullDescription),
      clean(data.themeConnection),
      clean(data.audienceSize),
      clean(data.audienceRationale),
      clean(data.dialogueParticipants),
      clean(data.panelists),
      clean(data.panelCount),
      clean(data.genderBalance),
      clean(data.workshopLength),
      clean(data.workshopMethod),
      clean(data.exhibitionDescription),
      clean(data.exhibitionDuration),
      clean(data.exhibitionSpace),
      clean(data.participantCount),
      clean(data.sessionStructure),
      clean(data.otherFormat),
      clean(data.materialsLink),
      clean(data.avNeeds),
      fileName,
      fileUrl,
      clean(data.submittedFrom)
    ]);

    return responsePage(true, submissionId, "Submission saved.");
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return responsePage(false, "", err && err.message ? err.message : "Unknown server error.");
  }
}

function validateSubmission(data) {
  const required = [
    ["nameAffiliation","Name and affiliation"],
    ["email","Email"],
    ["format","Format"],
    ["title","Title"],
    ["programText","Short program description"],
    ["fullDescription","Full description"],
    ["themeConnection","Connection to the conference theme"],
    ["audienceSize","Audience size"],
    ["confirmation","Confirmation"]
  ];
  required.forEach(([key,label]) => {
    if (!data[key]) throw new Error(label + " is required.");
  });

  if (data.format === "Panel" && Number(data.panelCount || 0) > 4) {
    throw new Error("Panels may include no more than four speakers.");
  }
  if (data.finalPaper && Number(data.finalPaper.size || 0) > MAX_FILE_BYTES) {
    throw new Error("The uploaded file exceeds the 8 MB limit.");
  }
}

function getOrInitializeSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0 || sheet.getRange(1,1).getValue() !== HEADERS[0]) {
    sheet.clear();
    sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#171717")
      .setFontColor("#ffffff");
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

function saveUploadedFile(fileData, submissionId) {
  const bytes = Utilities.base64Decode(fileData.base64);
  if (bytes.length > MAX_FILE_BYTES) throw new Error("The uploaded file exceeds the 8 MB limit.");

  const safeName = sanitizeFilename(fileData.name || "final-paper");
  const blob = Utilities.newBlob(bytes, fileData.type || "application/octet-stream", submissionId + "_" + safeName);
  const folder = getUploadFolder();
  const file = folder.createFile(blob);

  return { name: file.getName(), url: file.getUrl() };
}

function getUploadFolder() {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty("UPLOAD_FOLDER_ID");
  if (existingId) {
    try { return DriveApp.getFolderById(existingId); } catch (err) {}
  }

  const folders = DriveApp.getFoldersByName(UPLOAD_FOLDER_NAME);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(UPLOAD_FOLDER_NAME);
  props.setProperty("UPLOAD_FOLDER_ID", folder.getId());
  return folder;
}

function sanitizeFilename(name) {
  return String(name).replace(/[^a-zA-Z0-9._()\- ]+/g, "_").slice(0, 180);
}

function clean(value) {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value).trim();
}

function responsePage(ok, submissionId, message) {
  const payload = JSON.stringify({
    type: "solidarity-ai-submit",
    ok: Boolean(ok),
    submissionId: submissionId || "",
    message: message || ""
  }).replace(/</g, "\\u003c");

  return HtmlService.createHtmlOutput(
    "<!doctype html><html><body><script>" +
    "window.parent.postMessage(" + payload + ", '*');" +
    "</script></body></html>"
  );
}

function initializeSheet() {
  getOrInitializeSheet();
}
