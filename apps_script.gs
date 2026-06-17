/**
 * Google Apps Script for Ankita & Shyam's wedding RSVP site.
 *
 * Two actions handled via POST:
 *   - action: "submit"  (default) — append an RSVP row to the Sheet.
 *   - action: "results" — return the Sheet rows as JSON, gated by a password.
 *
 * SETUP — RSVP collection (one-time):
 *   1. Create a Google Sheet, e.g. "Ankita & Shyam RSVPs".
 *   2. Extensions → Apps Script. Paste this file in. Save.
 *   3. Deploy → New deployment → gear → Web app.
 *        Execute as: Me
 *        Who has access: Anyone   ← important
 *   4. Authorise. Copy the /exec URL into js/config.js as rsvp.endpoint.
 *
 * SETUP — Results viewer password (one-time):
 *   1. In the Apps Script editor: Project Settings (gear, left rail)
 *      → "Script properties" → "Add script property".
 *   2. Property name:  RESULTS_PASSWORD
 *      Value:          (a password you'll share with family)
 *   3. Save. No re-deploy needed for property changes.
 *
 * RE-DEPLOYING after editing this script:
 *   Deploy → Manage deployments → pencil → Version: New version → Deploy.
 *   The /exec URL stays the same.
 */

// Append-only column order. New fields go at the end so existing rows stay
// aligned when the script is re-deployed onto a Sheet with older data.
const HEADERS = [
  'submittedAt',
  'name',
  'attending',
  'scope',
  'attendingEvents',
  'foodChoices',
  'accommodation',
  'notes',
  'rawPayload',
  'side',
  'partySize',
  'partyNames'
];

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};

    if (body.action === 'results') {
      return handleResults(body.password);
    }
    return handleSubmit(body);

  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function handleSubmit(body) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  ensureHeaders(sheet);

  const sideLabel = body.side === 'bride' ? "Bride's side"
                  : body.side === 'groom' ? "Groom's side"
                  : '';

  sheet.appendRow([
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
    JSON.stringify(body),
    sideLabel,
    body.partySize || 1,
    Array.isArray(body.partyNames) ? body.partyNames.join(', ') : ''
  ]);

  return jsonOut({ ok: true });
}

// Idempotently extends the header row to match HEADERS. Existing column
// labels are preserved (so manual renames stick), only empty cells get filled.
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    return;
  }
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const existing = range.getValues()[0];
  let changed = false;
  for (let i = 0; i < HEADERS.length; i++) {
    if (!existing[i]) { existing[i] = HEADERS[i]; changed = true; }
  }
  if (changed) {
    range.setValues([existing]);
    sheet.setFrozenRows(1);
  }
}

function handleResults(submittedPassword) {
  const expected = PropertiesService.getScriptProperties().getProperty('RESULTS_PASSWORD');

  // If no password is configured, refuse — don't accidentally expose data.
  if (!expected) {
    return jsonOut({ ok: false, error: 'not-configured' });
  }
  if (!submittedPassword || submittedPassword !== expected) {
    return jsonOut({ ok: false, error: 'auth' });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    return jsonOut({ ok: true, headers: HEADERS, rows: [] });
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1).map(function (row) {
    return row.map(function (cell) {
      // Dates → ISO strings so the browser receives plain text.
      return cell instanceof Date ? cell.toISOString() : cell;
    });
  });

  return jsonOut({ ok: true, headers: headers, rows: rows });
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput('RSVP endpoint is live. POST JSON here.')
    .setMimeType(ContentService.MimeType.TEXT);
}
