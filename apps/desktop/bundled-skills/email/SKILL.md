---
name: email
description: Compose, send, read, and reply to emails using Gmail or Outlook Web via browser automation.
command: /email
verified: true
---

# Email Automation (Gmail & Outlook Web)

This skill automates email tasks through the browser using Gmail or Outlook Web. Every action requires your explicit request.

## Prerequisites

- User must be signed in to Gmail or Outlook in the browser
- The dev-browser tool must be available
- Chrome is used via the dev-browser automation

## Important Safety Rules

- **NEVER** send an email without the user explicitly asking
- **ALWAYS** confirm the recipient, subject, and body before sending
- **NEVER** open or forward emails to addresses the user did not specify
- **NEVER** delete emails without explicit permission
- **NEVER** enter passwords or credentials — the user must already be signed in
- If a login screen appears, stop and tell the user to sign in manually first

## Detecting the Email Provider

1. Ask the user which email they want to use (Gmail or Outlook), or
2. Navigate to `https://mail.google.com` for Gmail, or `https://outlook.live.com/mail/` for Outlook
3. Take a screenshot to verify the inbox loaded
4. If a login screen appears, tell the user to sign in first

## Gmail Actions

### 1. Send a New Email

**Steps:**

1. Navigate to `https://mail.google.com`
2. Wait for the inbox to load (look for the email list)
3. Click the "Compose" button (top-left, or press `C`)
4. In the "To" field, type the recipient email address
5. Press `Tab` to move to the Subject field
6. Type the subject line
7. Press `Tab` to move to the body
8. Type the email body content
9. Take a screenshot showing the composed email
10. **Ask the user to confirm** before sending
11. Click the "Send" button (or press `Ctrl+Enter`)
12. Take a screenshot confirming the email was sent

**Confirmation template:**
> I'm about to send this email:
> **To:** {recipient}
> **Subject:** {subject}
> **Body:** {first 100 chars}...
> Should I proceed?

### 2. Read Recent Emails (Gmail)

**Steps:**

1. Navigate to `https://mail.google.com`
2. Wait for inbox to load
3. Take a screenshot of the inbox
4. Use `browser_get_text` to extract sender names, subjects, and preview text
5. If the user wants to read a specific email, click on it
6. Take a screenshot of the full email
7. Use `browser_get_text` to extract the complete email content
8. Present the content to the user

**Output format:**
```
Inbox ({count} recent):
1. From: {sender} | Subject: {subject} | {time}
   Preview: {first line}
2. From: {sender} | Subject: {subject} | {time}
   Preview: {first line}
...
```

### 3. Reply to an Email (Gmail)

**Steps:**

1. Open the specific email (search or click from inbox)
2. Scroll to the bottom of the email thread
3. Click the "Reply" button (or press `R`)
4. Type the reply message in the compose box
5. Take a screenshot showing the reply
6. **Ask the user to confirm** before sending
7. Click "Send" (or press `Ctrl+Enter`)

### 4. Search Emails (Gmail)

**Steps:**

1. Click the search bar at the top of Gmail (or press `/`)
2. Type the search query (sender, subject, keywords)
3. Press `Enter`
4. Take a screenshot of the search results
5. Extract and present the matching emails

**Search operators:**
- `from:name@email.com` — emails from a specific sender
- `to:name@email.com` — emails to a specific recipient
- `subject:keyword` — emails with keyword in subject
- `has:attachment` — emails with attachments
- `newer_than:7d` — emails from the last 7 days
- `is:unread` — unread emails only

## Outlook Web Actions

### 1. Send a New Email (Outlook)

**Steps:**

1. Navigate to `https://outlook.live.com/mail/`
2. Wait for the inbox to load
3. Click "New mail" button (top-left)
4. In the "To" field, type the recipient email
5. Click the "Subject" field and type the subject
6. Click the body area and type the content
7. Take a screenshot showing the composed email
8. **Ask the user to confirm**
9. Click "Send"

### 2. Read Recent Emails (Outlook)

**Steps:**

1. Navigate to `https://outlook.live.com/mail/`
2. Wait for inbox to load
3. Take a screenshot of the inbox list
4. Extract sender, subject, and preview using `browser_get_text`
5. Click on a specific email to read the full content

### 3. Reply to an Email (Outlook)

**Steps:**

1. Open the specific email
2. Click "Reply" at the top of the email
3. Type the reply in the compose area
4. Take a screenshot for confirmation
5. **Ask the user to confirm**
6. Click "Send"

### 4. Search Emails (Outlook)

**Steps:**

1. Click the search bar at the top (or press `Alt+Q`)
2. Type the search query
3. Press `Enter`
4. Take a screenshot and extract results

## Gmail Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `C` | Compose new email |
| `R` | Reply |
| `A` | Reply all |
| `F` | Forward |
| `/` | Focus search bar |
| `E` | Archive |
| `#` | Delete |
| `Ctrl+Enter` | Send email |
| `Ctrl+Shift+C` | Add CC |
| `Ctrl+Shift+B` | Add BCC |
| `J` / `K` | Next / previous email |
| `O` or `Enter` | Open email |
| `U` | Return to inbox |

## Outlook Web Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New email |
| `R` | Reply |
| `Ctrl+Shift+R` | Reply all |
| `Ctrl+Shift+F` | Forward |
| `Ctrl+Enter` | Send |
| `Alt+Q` | Search |
| `Delete` | Delete email |
| `E` | Archive |

## UI Reference

### Gmail

| Element | Location |
|---------|----------|
| Compose button | Top-left, above folder list |
| Search bar | Top center, full width |
| Inbox list | Center panel |
| Email view | Center panel (replaces list) |
| Reply box | Bottom of email thread |
| Send button | Bottom-left of compose window |
| CC/BCC | Click "Cc" or "Bcc" links next to "To" field |

### Outlook Web

| Element | Location |
|---------|----------|
| New mail button | Top-left |
| Search bar | Top center |
| Inbox list | Left panel |
| Email view | Right panel (reading pane) |
| Reply button | Top of email |
| Send button | Top-left of compose area |

## Error Recovery

- **Login screen**: Tell the user to sign in to their email account manually, then retry
- **Compose window not opening**: Try the keyboard shortcut (`C` for Gmail, `N` for Outlook) instead of clicking
- **Email not sending**: Check for red error banners, verify the recipient address is valid
- **Search returns nothing**: Try broader search terms, check spam/trash folders
- **Two-factor auth prompt**: Tell the user to complete 2FA manually

## Browser Automation Tips

- Always take screenshots before and after significant actions
- Gmail and Outlook use heavy JavaScript rendering — wait for pages to settle
- Use keyboard shortcuts over clicking when possible — they are more reliable
- Coordinate-based clicks for buttons when DOM references are unreliable
- Gmail may show different layouts (default, compact, comfortable) — adapt accordingly
- Outlook may show a reading pane on the right — emails open inline, not as a new page
