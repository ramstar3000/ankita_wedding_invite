/**
 * Google Apps Script for collecting wedding RSVPs into a Google Sheet.
 *
 * SETUP (one-time, ~10 minutes):
 *
 * 1. Create a new Google Sheet (any name, e.g. "Ankita & Shyam RSVPs").
 * 2. In the Sheet: Extensions → Apps Script. A new editor tab opens.
 * 3. Delete the default `Code.gs` contents and paste THIS file in.
 * 4. Click the disk icon to save (project name can be anything).
 * 5. Click "Deploy" (top right) → "New deployment".
 *      - Gear icon → "Web app"
 *      - Description: "RSVP endpoint"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"  ← important
 *      - Click "Deploy"
 * 6. Authorise when prompted (you'll need to click "Advanced" → "Go to … (unsafe)"
 *    because the script is unverified — it's yours, that's fine).
 * 7. Copy the "Web app URL" (ends in /exec). Paste it into
 *    js/config.js as `rsvp.endpoint`.
 * 8. Submit a test RSVP from the live site — a row should appear in the Sheet.
 *
 * RE-DEPLOYING:
 *   If you edit this script later, you MUST Deploy → Manage deployments →
 *   pencil icon → Version: New version → Deploy. The /exec URL stays the same.
 */

// Header row written the first time the sheet is empty.
const HEADERS = [
  'submittedAt',
  'name',
  'attending',
  'scope',
  'attendingEvents',
  'foodChoices',
  'accommodation',
  'notes',
  'rawPayload'
];

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Write headers if the sheet is empty (first ever submission).
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    const row = [
      body.submittedAt || new Date().toISOString(),
      body.name || '',
      body.attending === true ? 'Yes' : body.attending === false ? 'No' : '',
      body.scope || '',
      Array.isArray(body.attendingEvents) ? body.attendingEvents.join(', ') : '',
      Array.isArray(body.foodChoices)
        ? body.foodChoices.map(function (f) { return f.meal + ': ' + f.choice; }).join('; ')
        : '',
      body.accommodation || '',
      body.notes || '',
      JSON.stringify(body)
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// A GET handler so you can paste the /exec URL into a browser
// and confirm the deployment is live before wiring it up.
function doGet() {
  return ContentService
    .createTextOutput('RSVP endpoint is live. POST JSON here.')
    .setMimeType(ContentService.MimeType.TEXT);
}
