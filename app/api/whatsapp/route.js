import { NextResponse } from "next/server";

let manager;
function getManager() {
  if (!manager) {
    manager = require("../../../lib/whatsapp-manager");
  }
  return manager;
}

/**
 * GET /api/whatsapp?action=status|conversations|messages&session=...&chatId=...
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";
    const session = searchParams.get("session");

    if (!session) {
      return NextResponse.json({ error: "session required" }, { status: 400 });
    }

    const mgr = getManager();

    switch (action) {
      case "status": {
        const status = mgr.getStatus(session);
        // needs_reconnect: trigger reconnect in background
        if (status.status === "needs_reconnect" && status.hasTokens) {
          mgr.startSession(session).catch((err) => {
            console.error(`[WA API] Auto-reconnect error: ${err.message}`);
          });
          return NextResponse.json({
            ...status,
            status: "connecting",
            message: "جاري إعادة الاتصال...",
          });
        }
        // idle: browser is closed to save RAM, will auto-reconnect on next action
        return NextResponse.json(status);
      }

      case "conversations": {
        const convos = mgr.getConversations(session);
        return NextResponse.json({ conversations: convos });
      }

      case "messages": {
        const chatId = searchParams.get("chatId");
        if (!chatId) {
          return NextResponse.json(
            { error: "chatId required" },
            { status: 400 },
          );
        }
        const messages = mgr.getMessages(session, chatId);
        return NextResponse.json({ messages });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/whatsapp
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, session } = body;

    if (!session) {
      return NextResponse.json({ error: "session required" }, { status: 400 });
    }

    const mgr = getManager();

    switch (action) {
      case "connect": {
        mgr.startSession(session).catch((err) => {
          console.error(`[WA API] Connect error: ${err.message}`);
        });
        return NextResponse.json({
          status: "connecting",
          message: "جاري بدء الاتصال...",
        });
      }

      case "disconnect": {
        const state = await mgr.disconnectSession(session);
        return NextResponse.json({
          status: state.status,
          message: "تم قطع الاتصال",
        });
      }

      case "send_text": {
        const { phone, message } = body;
        if (!phone || !message)
          return NextResponse.json(
            { error: "phone, message required" },
            { status: 400 },
          );
        await mgr.sendText(session, phone, message);
        return NextResponse.json({
          success: true,
          message: "✅ تم إرسال الرسالة",
        });
      }

      case "reply": {
        const { chatId, message: replyMsg } = body;
        if (!chatId || !replyMsg)
          return NextResponse.json(
            { error: "chatId, message required" },
            { status: 400 },
          );
        await mgr.replyToChat(session, chatId, replyMsg);
        return NextResponse.json({
          success: true,
          message: "✅ تم إرسال الرد",
        });
      }

      case "send_image": {
        const { phone: p1, image, caption: c1 } = body;
        if (!p1 || !image)
          return NextResponse.json(
            { error: "phone, image required" },
            { status: 400 },
          );
        await mgr.sendImage(session, p1, image, c1);
        return NextResponse.json({
          success: true,
          message: "✅ تم إرسال الصورة",
        });
      }

      case "send_file": {
        const { phone: p2, file, filename, caption: c2 } = body;
        if (!p2 || !file)
          return NextResponse.json(
            { error: "phone, file required" },
            { status: 400 },
          );
        await mgr.sendFile(session, p2, file, filename, c2);
        return NextResponse.json({
          success: true,
          message: "✅ تم إرسال الملف",
        });
      }

      case "send_location": {
        const { phone: p3, lat, lng, title } = body;
        if (!p3 || lat === undefined || lng === undefined)
          return NextResponse.json(
            { error: "phone, lat, lng required" },
            { status: 400 },
          );
        await mgr.sendLocation(session, p3, lat, lng, title);
        return NextResponse.json({
          success: true,
          message: "✅ تم إرسال الموقع",
        });
      }

      case "send_link": {
        const { phone: p4, url, caption: c3 } = body;
        if (!p4 || !url)
          return NextResponse.json(
            { error: "phone, url required" },
            { status: 400 },
          );
        await mgr.sendLinkPreview(session, p4, url, c3);
        return NextResponse.json({
          success: true,
          message: "✅ تم إرسال الرابط",
        });
      }

      case "send_contact": {
        const { phone: p5, contactPhone, contactName } = body;
        if (!p5 || !contactPhone || !contactName)
          return NextResponse.json(
            { error: "phone, contactPhone, contactName required" },
            { status: 400 },
          );
        await mgr.sendContactVcard(session, p5, contactPhone, contactName);
        return NextResponse.json({
          success: true,
          message: "✅ تم إرسال جهة الاتصال",
        });
      }

      case "send_seen": {
        const { phone: p6 } = body;
        if (!p6)
          return NextResponse.json(
            { error: "phone required" },
            { status: 400 },
          );
        await mgr.sendSeen(session, p6);
        return NextResponse.json({ success: true, message: "✅ تعليم مقروء" });
      }

      case "start_typing": {
        const { phone: p7 } = body;
        if (!p7)
          return NextResponse.json(
            { error: "phone required" },
            { status: 400 },
          );
        await mgr.startTyping(session, p7);
        return NextResponse.json({ success: true });
      }

      case "stop_typing": {
        const { phone: p8 } = body;
        if (!p8)
          return NextResponse.json(
            { error: "phone required" },
            { status: 400 },
          );
        await mgr.stopTyping(session, p8);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
