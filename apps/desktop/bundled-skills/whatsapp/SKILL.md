---
name: whatsapp
description: Send messages, read chats, and reply to contacts or groups on WhatsApp Web using browser automation.
command: /whatsapp
verified: true
---

# WhatsApp Web Automation

This skill automates WhatsApp Web through the browser. Every action requires your explicit request — nothing runs in the background.

## Prerequisites

- WhatsApp Web must be linked to your phone (scan QR code once)
- The dev-browser tool must be available
- Chrome is used via the dev-browser automation

## Important Safety Rules

- **NEVER** monitor messages in the background or auto-reply
- **NEVER** send a message without the user explicitly asking
- **ALWAYS** confirm the contact name and message content before sending
- **NEVER** access or forward messages to third parties
- **NEVER** download media or files without explicit permission
- If WhatsApp Web asks to re-scan QR code, stop and tell the user

## Core Actions

### 1. Send a Message to a Contact or Group

**Steps:**

1. Navigate to `https://web.whatsapp.com`
2. Wait for WhatsApp Web to fully load (look for the chat list on the left side)
3. If a QR code screen appears, stop and tell the user to scan it with their phone
4. Click the search bar at the top of the chat list (or press `Ctrl+K` to open search)
5. Type the contact or group name exactly as the user specified
6. Wait for search results to appear
7. Take a screenshot to verify the correct contact is shown
8. Click on the matching contact/group from the search results
9. Click the message input box at the bottom of the chat
10. Type the message the user dictated
11. Take a screenshot showing the typed message for the user to verify
12. **Ask the user to confirm** before pressing Enter to send
13. Press `Enter` to send the message
14. Take a screenshot confirming the message was sent (look for the checkmark)

**Confirmation template:**
> I'm about to send this message to **{contact}**:
> "{message}"
> Should I proceed?

### 2. Read Recent Messages from a Chat

**Steps:**

1. Navigate to `https://web.whatsapp.com`
2. Wait for WhatsApp Web to load
3. Search for the contact/group using `Ctrl+K`
4. Click on the matching contact/group
5. Take a screenshot of the visible chat messages
6. Use `browser_get_text` to extract message text from the chat area
7. If the user asked for more messages, scroll up to load older messages
8. Compile the messages and present them to the user

**Output format:**
```
Last N messages from {contact}:
1. [sender] (time): message text
2. [sender] (time): message text
...
```

### 3. Reply to a Specific Message

**Steps:**

1. Open the chat (same as reading messages above)
2. Read recent messages to find the one the user wants to reply to
3. Hover over the specific message to reveal the reply arrow
4. Click the down-arrow or right-click the message
5. Click "Reply" from the context menu
6. Type the reply message in the input box
7. Take a screenshot showing the reply preview
8. **Ask the user to confirm** before sending
9. Press `Enter` to send

### 4. Check Unread Messages

**Steps:**

1. Navigate to `https://web.whatsapp.com`
2. Wait for the chat list to load
3. Take a screenshot of the chat list
4. Look for chats with green unread badges (number indicators)
5. Extract the contact names and unread counts
6. Present a summary to the user

**Output format:**
```
Unread messages:
- {contact}: {count} unread
- {group}: {count} unread
```

## WhatsApp Web UI Reference

| Element | Location | How to interact |
|---------|----------|-----------------|
| Search bar | Top of left sidebar | Click or press `Ctrl+K` |
| Chat list | Left sidebar | Click on a contact to open |
| Message input | Bottom of chat area | Click to focus, type message |
| Send button | Right side of input box | Click or press `Enter` |
| Reply arrow | Hover over a message | Click down-arrow icon |
| Attach button | Left of message input (paperclip) | Click to attach files |
| Emoji button | Left of message input (smiley) | Click to open emoji picker |
| Unread badge | On chat list items | Green circle with number |
| Back arrow | Top of chat area | Click to return to chat list |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open search |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Escape` | Close search/panels |
| `Ctrl+Shift+M` | Mute chat |

## Error Recovery

- **QR code screen**: Tell the user to open WhatsApp on their phone → Settings → Linked Devices → Link a Device → Scan the QR code
- **Chat not found**: Try alternative name spellings, or ask the user for the exact contact name as it appears in their WhatsApp
- **Message failed to send**: Check if the red clock icon appears, retry after a few seconds
- **WhatsApp disconnected**: Look for "Phone not connected" banner — tell the user to check their phone's internet connection

## Browser Automation Tips

- Always take screenshots before and after significant actions
- WhatsApp Web uses dynamic rendering — wait for elements to settle after navigation
- Use coordinate-based clicks when DOM references are unreliable
- The chat list scrolls — if a contact is not visible, use search instead of scrolling
- Message timestamps may be relative ("today", "yesterday") — note this when reading
