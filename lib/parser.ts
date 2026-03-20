import { RawEmail } from './types';

export function parseCSV(csvContent: string): RawEmail[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Parse header
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const subjectIndex = header.indexOf('subject');
  const bodyIndex = header.indexOf('body');
  const sentAtIndex = header.indexOf('sent_at');
  const senderIndex = header.indexOf('sender');

  if (subjectIndex === -1 || bodyIndex === -1 || sentAtIndex === -1) {
    throw new Error('CSV must contain: subject, body, sent_at columns');
  }

  // Optional columns
  const senderNameIndex = header.indexOf('sender_name');

  const emails: RawEmail[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const columns = parseCSVLine(line);

      const email: RawEmail = {
        subject: columns[subjectIndex]?.trim() || '',
        body: columns[bodyIndex]?.trim() || '',
        sent_at: columns[sentAtIndex]?.trim() || new Date().toISOString(),
        sender: senderIndex !== -1 ? columns[senderIndex]?.trim() || 'Unknown' : 'Unknown',
        sender_name: senderNameIndex !== -1 ? columns[senderNameIndex]?.trim() || 'Unknown' : 'Unknown',
      };

      if (!email.subject && !email.body) {
        continue; // Skip empty rows
      }

      emails.push(email);
    } catch (error) {
      console.error(`Error parsing row ${i}:`, error);
      continue; // Skip malformed rows
    }
  }

  if (emails.length === 0) {
    throw new Error('No valid emails found in CSV');
  }

  return emails;
}

// Simple CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}
