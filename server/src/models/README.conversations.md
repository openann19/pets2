# Conversation Model

Lightweight 1:1 direct messages decoupled from Matches.

- Use `findOrCreateOneToOne(userA, userB)` to ensure a DM thread exists.
- Use `addMessage(senderId, content, attachments)` to append a message.
- Use `markMessagesAsRead(userId)` to update read receipts.
- Use `getMessagesPage(conversationId, { before?, limit? })` for cursor-based pagination.

Sockets:
- Chat room: `chat:<conversationId>` emits `message:received` payloads
- Notifications: `notifications:<userId>` emits message notifications
