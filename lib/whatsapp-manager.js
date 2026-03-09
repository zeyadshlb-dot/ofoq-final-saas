/**
 * WhatsApp Session Manager (Singleton via globalThis)
 * Persists state to JSON file + survives Next.js hot-reloads via globalThis.
 */

const fs = require("fs");
const path = require("path");

let wppconnect;
try {
  wppconnect = require("@wppconnect-team/wppconnect");
} catch (e) {
  console.warn("[WA] wppconnect not available:", e.message);
}

// ─── Persist across hot-reloads using globalThis ───
const GLOBAL_KEY = "__OFOQ_WA_SESSIONS__";
if (!globalThis[GLOBAL_KEY]) {
  globalThis[GLOBAL_KEY] = new Map();
}
const sessions = globalThis[GLOBAL_KEY];

// ─── Message store (persists across hot-reloads) ───
const MSG_KEY = "__OFOQ_WA_MESSAGES__";
if (!globalThis[MSG_KEY]) {
  globalThis[MSG_KEY] = new Map(); // Map<sessionId, Map<chatId, Message[]>>
}
const messageStore = globalThis[MSG_KEY];

// ─── Idle timers (persists across hot-reloads) ───
const TIMER_KEY = "__OFOQ_WA_IDLE_TIMERS__";
if (!globalThis[TIMER_KEY]) {
  globalThis[TIMER_KEY] = new Map(); // Map<sessionId, timeoutId>
}
const idleTimers = globalThis[TIMER_KEY];

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const MAX_MESSAGES_PER_CHAT = 200;

function storeMessage(sessionId, chatId, msg) {
  if (!messageStore.has(sessionId)) messageStore.set(sessionId, new Map());
  const chats = messageStore.get(sessionId);
  if (!chats.has(chatId)) chats.set(chatId, []);
  const msgs = chats.get(chatId);
  msgs.push(msg);
  // Keep only last N messages per chat
  if (msgs.length > MAX_MESSAGES_PER_CHAT) msgs.shift();
}

// ─── JSON file for persistence across full restarts ───
const STATE_DIR = path.join(process.cwd(), ".whatsapp-state");
function getStateFile(sessionId) {
  return path.join(STATE_DIR, `${sessionId}.json`);
}

function saveState(sessionId, state) {
  try {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
    const data = {
      status: state.status,
      connectedPhone: state.connectedPhone,
      lastActivity: state.lastActivity,
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(getStateFile(sessionId), JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("[WA] Failed to save state:", e.message);
  }
}

function loadState(sessionId) {
  try {
    const file = getStateFile(sessionId);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (e) {
    console.error("[WA] Failed to load state:", e.message);
  }
  return null;
}

function clearState(sessionId) {
  try {
    const file = getStateFile(sessionId);
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch (e) {
    // ignore
  }
}

// ─── Check if token files exist (wppconnect saves them) ───
function hasTokens(sessionId) {
  const tokenDir = path.join(process.cwd(), "whatsapp-tokens");
  const sessionName = `ofoq_${sessionId}`;
  try {
    if (fs.existsSync(tokenDir)) {
      const files = fs.readdirSync(tokenDir);
      return files.some((f) => f.includes(sessionName));
    }
  } catch (e) {
    // ignore
  }
  return false;
}

/**
 * Reset the idle timer for a session.
 * After IDLE_TIMEOUT_MS of no activity, close browser to free RAM.
 */
function resetIdleTimer(sessionId) {
  // Clear existing timer
  if (idleTimers.has(sessionId)) {
    clearTimeout(idleTimers.get(sessionId));
  }

  const timer = setTimeout(() => {
    closeIdleBrowser(sessionId);
  }, IDLE_TIMEOUT_MS);

  idleTimers.set(sessionId, timer);
}

/**
 * Close the Chromium browser for a session to free RAM.
 * Keeps session state as 'idle' so it can auto-reconnect.
 */
async function closeIdleBrowser(sessionId) {
  const state = getSessionState(sessionId);
  if (!state.client) return;

  console.log(
    `[WA:${sessionId}] ⚡ Idle timeout — closing browser to free RAM`,
  );

  try {
    await state.client.close();
  } catch (e) {
    console.error(`[WA:${sessionId}] Error closing idle browser:`, e.message);
  }

  state.client = null;
  state.status = "idle"; // Special status: was connected, can auto-reconnect
  // Keep connectedPhone and lastActivity for UI display
  saveState(sessionId, state);

  // Clear the timer
  if (idleTimers.has(sessionId)) {
    clearTimeout(idleTimers.get(sessionId));
    idleTimers.delete(sessionId);
  }

  console.log(
    `[WA:${sessionId}] ✅ Browser closed. Will auto-reconnect when needed.`,
  );
}

/**
 * Get or create session state for a tenant
 */
function getSessionState(sessionId) {
  if (!sessions.has(sessionId)) {
    // Try to load from file first
    const saved = loadState(sessionId);
    const initial = {
      status: "disconnected",
      qrCode: null,
      client: null,
      error: null,
      connectedPhone: null,
      lastActivity: null,
    };
    if (saved && (saved.status === "connected" || saved.status === "idle")) {
      // We had a previous session — mark as idle (will auto-reconnect when needed)
      initial.status = "idle";
      initial.connectedPhone = saved.connectedPhone;
      initial.lastActivity = saved.lastActivity;
    }
    sessions.set(sessionId, initial);
  }
  return sessions.get(sessionId);
}

/**
 * Start a WhatsApp session
 */
async function startSession(sessionId) {
  if (!wppconnect) {
    throw new Error("wppconnect library not available");
  }

  const state = getSessionState(sessionId);

  // If already connected, just reset idle timer
  if (state.status === "connected" && state.client) {
    resetIdleTimer(sessionId);
    return state;
  }

  // If already connecting or qr_ready, don't start again
  if (state.status === "connecting" || state.status === "qr_ready") {
    return state;
  }

  state.status = "connecting";
  state.qrCode = null;
  state.error = null;

  try {
    const client = await wppconnect.create({
      session: `ofoq_${sessionId}`,
      headless: true,
      useChrome: false,
      logQR: false,
      autoClose: 86400000, // 24h in ms — effectively disabled (lib ignores false/0)
      disableWelcome: true,
      updatesLog: false,
      folderNameToken: "./whatsapp-tokens",
      catchQR: (base64Qr, asciiQR, attempts) => {
        const s = getSessionState(sessionId);
        s.qrCode = base64Qr;
        s.status = "qr_ready";
        console.log(`[WA:${sessionId}] QR generated (attempt ${attempts})`);
      },
      statusFind: (statusSession) => {
        const s = getSessionState(sessionId);
        console.log(`[WA:${sessionId}] statusFind: ${statusSession}`);

        switch (statusSession) {
          case "isLogged":
          case "qrReadSuccess":
          case "inChat": // ← THIS WAS MISSING! inChat = connected & ready
            s.status = "connected";
            s.qrCode = null;
            s.lastActivity = new Date().toISOString();
            saveState(sessionId, s);
            break;
          case "notLogged":
            if (s.status !== "qr_ready") s.status = "qr_ready";
            break;
          case "browserClose":
          case "serverClose":
            s.status = "disconnected";
            s.client = null;
            s.qrCode = null;
            clearState(sessionId);
            break;
          case "desconnectedMobile":
            // Phone disconnected - keep tokens, just mark as needs_reconnect
            s.status = "disconnected";
            s.client = null;
            s.qrCode = null;
            // Don't clear state so auto-reconnect can use saved tokens
            break;
          case "autocloseCalled":
            // Should never happen now with autoClose: false
            console.warn(`[WA:${sessionId}] autoClose called unexpectedly`);
            s.status = "disconnected";
            s.client = null;
            s.qrCode = null;
            break;
          case "qrReadFail":
            s.status = "error";
            s.error = "فشل قراءة QR Code. حاول مرة أخرى.";
            break;
          default:
            console.log(
              `[WA:${sessionId}] Unhandled statusFind: ${statusSession}`,
            );
            break;
        }
      },
      browserArgs: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    // wppconnect.create() resolved = session is ready
    state.client = client;
    state.status = "connected";
    state.qrCode = null;
    state.lastActivity = new Date().toISOString();

    // Get phone info
    try {
      const hostDevice = await client.getHostDevice();
      state.connectedPhone = hostDevice?.wid?.user || null;
    } catch (e) {
      // ignore
    }

    // Persist to JSON
    saveState(sessionId, state);

    // ⚡ Start the idle timer
    resetIdleTimer(sessionId);
    console.log(
      `[WA:${sessionId}] ⏱️ Idle timer started (${IDLE_TIMEOUT_MS / 1000}s)`,
    );

    // Listen for incoming messages — store them
    client.onMessage((message) => {
      const s = getSessionState(sessionId);
      s.lastActivity = new Date().toISOString();

      // Store the message
      const chatId = message.from;
      const stored = {
        id: message.id || Date.now().toString(),
        from: message.from,
        to: message.to,
        body: message.body || "",
        type: message.type || "chat",
        timestamp: message.timestamp ? message.timestamp * 1000 : Date.now(),
        isGroupMsg: message.isGroupMsg || false,
        sender:
          message.sender?.pushname ||
          message.sender?.name ||
          message.from?.split("@")?.[0] ||
          "Unknown",
        isMe: false,
        hasMedia: !!message.isMedia || !!message.isMMS,
        mimetype: message.mimetype || null,
        caption: message.caption || null,
      };
      storeMessage(sessionId, chatId, stored);

      console.log(
        `[WA:${sessionId}] MSG from ${stored.sender}: ${stored.body?.slice(0, 50)}`,
      );
    });

    // Also listen for sent messages (onAnyMessage includes our sent ones)
    client.onAnyMessage((message) => {
      if (message.fromMe) {
        const chatId = message.to;
        const stored = {
          id: message.id || Date.now().toString(),
          from: message.from,
          to: message.to,
          body: message.body || "",
          type: message.type || "chat",
          timestamp: message.timestamp ? message.timestamp * 1000 : Date.now(),
          isGroupMsg: message.isGroupMsg || false,
          sender: "أنت",
          isMe: true,
          hasMedia: !!message.isMedia || !!message.isMMS,
          mimetype: message.mimetype || null,
          caption: message.caption || null,
        };
        storeMessage(sessionId, chatId, stored);
      }
    });

    // Watch for state changes
    client.onStateChange((stateChange) => {
      console.log(`[WA:${sessionId}] onStateChange: ${stateChange}`);
      const s = getSessionState(sessionId);

      // CONNECTED = fully connected
      if (stateChange === "CONNECTED") {
        s.status = "connected";
        s.qrCode = null;
        s.lastActivity = new Date().toISOString();
        saveState(sessionId, s);
        return;
      }

      // CONFLICT = another WhatsApp Web session took over
      if (stateChange === "CONFLICT") {
        s.status = "disconnected";
        s.client = null;
        clearState(sessionId);
        return;
      }

      // UNPAIRED_IDLE = phone unlinked device
      if (stateChange === "UNPAIRED_IDLE" || stateChange === "UNPAIRED") {
        s.status = "disconnected";
        s.client = null;
        clearState(sessionId);
        return;
      }

      // UNLAUNCHED, OPENING, PAIRING, SYNCING = transitional states, ignore
      // These are part of the normal connection flow
    });

    return state;
  } catch (error) {
    state.status = "error";
    state.error = error.message;
    state.client = null;
    console.error(`[WA:${sessionId}] Error:`, error.message);
    return state;
  }
}

/**
 * Disconnect a WhatsApp session
 */
async function disconnectSession(sessionId) {
  const state = getSessionState(sessionId);

  // Clear idle timer
  if (idleTimers.has(sessionId)) {
    clearTimeout(idleTimers.get(sessionId));
    idleTimers.delete(sessionId);
  }

  if (state.client) {
    try {
      await state.client.logout();
      await state.client.close();
    } catch (e) {
      try {
        await state.client.close();
      } catch (e2) {
        // ignore
      }
    }
  }
  state.client = null;
  state.status = "disconnected";
  state.qrCode = null;
  state.connectedPhone = null;
  state.error = null;
  clearState(sessionId);
  return state;
}

/**
 * Get current session status (public-safe, no client ref)
 */
function getStatus(sessionId) {
  const state = getSessionState(sessionId);
  const activeTokens = hasTokens(sessionId);

  // Auto-fix if state was lost (process restart) but tokens exist
  if (state.status === "disconnected" && activeTokens) {
    state.status = "needs_reconnect";
    saveState(sessionId, state);
  }

  return {
    status: state.status,
    qrCode: state.qrCode,
    error: state.error,
    connectedPhone: state.connectedPhone,
    lastActivity: state.lastActivity,
    hasTokens: activeTokens,
    isIdle: state.status === "idle",
    idleTimeoutMs: IDLE_TIMEOUT_MS,
  };
}

/**
 * Send a text message
 */
async function sendText(sessionId, phone, message) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  try {
    const result = await client.sendText(chatId, message);
    touchActivity(sessionId);
    return result;
  } catch (error) {
    if (
      error &&
      error.message &&
      error.message.includes("not found") &&
      error.message.includes("Message")
    ) {
      console.warn(
        `[WA:${sessionId}] WPPConnect bug: ignoring 'not found', message likely sent to ${chatId}`,
      );
      touchActivity(sessionId);
      return {
        sendResult: "unknown",
        message: "Message sent, but got wppconnect error",
        originalError: error.message,
      };
    }
    throw error;
  }
}

/**
 * Send an image with caption (base64)
 */
async function sendImage(sessionId, phone, imageBase64, caption) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  const result = await client.sendFileFromBase64(
    chatId,
    imageBase64,
    "image.png",
    caption || "",
  );
  touchActivity(sessionId);
  return result;
}

/**
 * Send a file from base64
 */
async function sendFile(sessionId, phone, fileBase64, filename, caption) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  const result = await client.sendFileFromBase64(
    chatId,
    fileBase64,
    filename || "file",
    caption || "",
  );
  touchActivity(sessionId);
  return result;
}

/**
 * Send location
 */
async function sendLocation(sessionId, phone, lat, lng, title) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  const result = await client.sendLocation(
    chatId,
    String(lat),
    String(lng),
    title || "",
  );
  touchActivity(sessionId);
  return result;
}

/**
 * Send a link with preview
 */
async function sendLinkPreview(sessionId, phone, url, caption) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  const result = await client.sendLinkPreview(chatId, url, caption || "");
  touchActivity(sessionId);
  return result;
}

/**
 * Send a contact vCard
 */
async function sendContactVcard(sessionId, phone, contactPhone, contactName) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  const contactId = normPhone(contactPhone);
  const result = await client.sendContactVcard(chatId, contactId, contactName);
  touchActivity(sessionId);
  return result;
}

/**
 * Mark chat as seen
 */
async function sendSeen(sessionId, phone) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  await client.sendSeen(chatId);
  touchActivity(sessionId);
}

/**
 * Start typing indicator
 */
async function startTyping(sessionId, phone) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  await client.startTyping(chatId);
}

/**
 * Stop typing indicator
 */
async function stopTyping(sessionId, phone) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  await client.stopTyping(chatId);
}

/**
 * Set chat state (0: Typing, 1: Recording, 2: Paused)
 */
async function setChatState(sessionId, phone, chatState) {
  const client = await getConnectedClient(sessionId);
  const chatId = normPhone(phone);
  await client.setChatState(chatId, chatState);
}

// ─── Shared helpers ───

function normPhone(phone) {
  let chatId = phone.replace(/[^0-9]/g, "");

  // Remove 00 prefix if someone types 002010... etc
  if (chatId.startsWith("00")) {
    chatId = chatId.substring(2);
  } else if (chatId.startsWith("0") && chatId.length === 11) {
    // Egypt local numbers: 01xxxxxxxxx -> 201xxxxxxxxx
    chatId = "2" + chatId;
  }

  if (!chatId.includes("@")) chatId = chatId + "@c.us";
  return chatId;
}

/**
 * Get a connected client, auto-reconnecting if session is idle.
 * This is the key to Lazy Loading.
 */
async function getConnectedClient(sessionId) {
  const state = getSessionState(sessionId);

  // Already connected — just reset idle timer
  if (state.client && state.status === "connected") {
    resetIdleTimer(sessionId);
    return state.client;
  }

  // Idle or needs_reconnect — auto-reconnect
  if (state.status === "idle" || state.status === "needs_reconnect") {
    if (hasTokens(sessionId)) {
      console.log(
        `[WA:${sessionId}] ⚡ Auto-reconnecting from ${state.status}...`,
      );
      const reconnected = await startSession(sessionId);
      if (reconnected.client && reconnected.status === "connected") {
        return reconnected.client;
      }
      throw new Error("فشل إعادة الاتصال تلقائياً. يرجى الاتصال يدوياً.");
    }
  }

  throw new Error("الواتساب غير متصل. يرجى الاتصال أولاً.");
}

function touchActivity(sessionId) {
  const state = getSessionState(sessionId);
  state.lastActivity = new Date().toISOString();
  saveState(sessionId, state);
  // Reset idle timer on every activity
  resetIdleTimer(sessionId);
}

/**
 * Get all conversations for a session (sorted by last message time)
 */
function getConversations(sessionId) {
  if (!messageStore.has(sessionId)) return [];

  const chats = messageStore.get(sessionId);
  const conversations = [];

  for (const [chatId, messages] of chats.entries()) {
    if (messages.length === 0) continue;
    const lastMsg = messages[messages.length - 1];
    const unread = messages.filter((m) => !m.isMe && !m.seen).length;

    conversations.push({
      chatId,
      name: lastMsg.sender || chatId.split("@")[0],
      phone: chatId.split("@")[0],
      lastMessage: lastMsg.body || (lastMsg.hasMedia ? "📎 ملف مرفق" : ""),
      lastTimestamp: lastMsg.timestamp,
      unread,
      isGroup: lastMsg.isGroupMsg,
      totalMessages: messages.length,
    });
  }

  // Sort by last message time (newest first)
  conversations.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  return conversations;
}

/**
 * Get messages for a specific chat
 */
function getMessages(sessionId, chatId) {
  if (!messageStore.has(sessionId)) return [];
  const chats = messageStore.get(sessionId);
  if (!chats.has(chatId)) return [];
  return chats.get(chatId);
}

/**
 * Reply to a message in a specific chat
 */
async function replyToChat(sessionId, chatId, message) {
  const client = await getConnectedClient(sessionId);
  const result = await client.sendText(chatId, message);
  touchActivity(sessionId);
  return result;
}

module.exports = {
  startSession,
  disconnectSession,
  getStatus,
  sendText,
  sendImage,
  sendFile,
  sendLocation,
  sendLinkPreview,
  sendContactVcard,
  sendSeen,
  startTyping,
  stopTyping,
  setChatState,
  getConversations,
  getMessages,
  replyToChat,
  getSessionState,
};
