export {};// Added to mark file as a module
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    attachments: [{ type: String }],
    sentAt: { type: Date, default: Date.now },
    readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: { type: Date, default: Date.now } }],
    // Message reactions (new field)
    reactions: [{
        emoji: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reactedAt: { type: Date, default: Date.now }
    }],
}, { _id: true });

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date, default: Date.now },
    messages: { type: [messageSchema], default: [] },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
// Optional index to speed up message lookups by id (best-effort)
conversationSchema.index({ 'messages._id': 1 });

conversationSchema.statics.findOrCreateOneToOne = async function (userA, userB) {
    const ids = [String(userA), String(userB)].sort();
    let conv = await this.findOne({ participants: { $all: ids, $size: 2 } });
    if (conv) return conv;
    conv = new this({ participants: ids });
    await conv.save();
    return conv;
};

conversationSchema.methods.addMessage = async function (senderId, content, attachments = []) {
    const msg = { sender: senderId, content, attachments, sentAt: new Date(), readBy: [{ user: senderId, readAt: new Date() }] };
    this.messages.push(msg);
    this.lastMessageAt = new Date();
    await this.save();
    return this.messages[this.messages.length - 1];
};

conversationSchema.methods.markMessagesAsRead = async function (userId) {
    let changed = false;
    for (const msg of this.messages) {
        const isSender = String(msg.sender) === String(userId);
        const already = (msg.readBy || []).some(r => String(r.user) === String(userId));
        if (!isSender && !already) {
            msg.readBy = msg.readBy || [];
            msg.readBy.push({ user: userId, readAt: new Date() });
            changed = true;
        }
    }
    if (changed) await this.save();
    return changed;
};

/**
 * Paginate messages with cursor by message _id (ObjectId chronological ordering)
 * Returns messages in ascending order (oldest -> newest) for UI simplicity
 */
conversationSchema.statics.getMessagesPage = async function (conversationId, { before, limit = 20 }) {
    limit = Math.max(1, Math.min(limit || 20, 100));

    const match = { _id: conversationId };
    const beforeCond = before ? { $lt: ["$$m._id", new mongoose.Types.ObjectId(String(before))] } : true;

    const [doc] = await this.aggregate([
        { $match: match },
        {
            $project: {
                messagesFiltered: {
                    $filter: { input: "$messages", as: "m", cond: before ? beforeCond : { $const: true } }
                }
            }
        },
        {
            $project: {
                count: { $size: "$messagesFiltered" },
                page: { $slice: ["$messagesFiltered", -limit] }
            }
        },
        {
            $project: {
                page: 1,
                hasMore: { $gt: ["$count", limit] },
                nextCursor: { $arrayElemAt: ["$page._id", 0] }
            }
        }
    ]);

    // Ensure ascending order
    const messages = (doc?.page || []).sort((a, b) => (a.sentAt || a._id.getTimestamp()) - (b.sentAt || b._id.getTimestamp()));
    const nextCursor = doc?.hasMore ? (doc?.nextCursor || (messages[0] && messages[0]._id)) : null;
    return { messages, nextCursor, hasMore: Boolean(doc?.hasMore) };
};

module.exports = mongoose.model('Conversation', conversationSchema);
