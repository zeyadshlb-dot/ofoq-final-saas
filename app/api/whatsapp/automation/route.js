import { NextResponse } from "next/server";

let manager;
function getManager() {
  if (!manager) {
    manager = require("../../../../lib/whatsapp-manager");
  }
  return manager;
}

/**
 * POST /api/whatsapp/automation
 * This endpoint is designed to be called by your Go backend or a Cron job
 * to trigger automated messages (Abandoned Cart, Welcome, Inactivity)
 * from the tenant's own connected WhatsApp session.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { session, automationType, phone, data } = body;

    // session = tenant domain (e.g., mo-academy.com)
    if (!session || !automationType || !phone) {
      return NextResponse.json(
        { error: "session, automationType, and phone are required" },
        { status: 400 },
      );
    }

    const mgr = getManager();
    const state = mgr.getStatus(session);

    // If tenant isn't connected, we can't send automations for them right now
    if (state.status === "disconnected" && !state.hasTokens) {
      return NextResponse.json(
        { error: "Tenant WhatsApp is not connected" },
        { status: 403 },
      );
    }

    let messageBody = "";

    // Build the dynamic message based on the automation type
    switch (automationType) {
      case "welcome_new_user":
        // data: { studentName: "Ahmed", platformName: "أكاديمية محمد" }
        messageBody = `أهلاً بك يا ${data?.studentName || "طالبنا العزيز"} في ${data?.platformName || "منصتنا"}! 🎉\n\nسعداء بانضمامك لينا. لو محتاج مساعدة في استكشاف الكورسات، إحنا معاك! 💡`;
        break;

      case "abandoned_cart":
        // data: { studentName: "Ahmed", courseName: "الفيزياء 3 ثانوي", link: "..." }
        messageBody = `أهلاً بك يا ${data?.studentName || "طالبنا"} 👋\n\nلاحظنا إنك مهتم بكورس *${data?.courseName}* ومكملتش الشراء. 🛒\nلو عندك أي مشكلة في الدفع أو استفسار، تقدر ترد علينا هنا وهنساعدك فوراً!\n\nرابط إكمال الاشتراك: ${data?.link}`;
        break;

      case "inactive_student":
        // data: { studentName: "Ahmed", courseName: "الفيزياء 3 ثانوي", days: 7 }
        messageBody = `وحشتنا يا ${data?.studentName}! 👀\n\nبقالك ${data?.days || "فترة"} مش بتفتح كورس *${data?.courseName}*.\nعشان توصل لهدفك لازم تستمر. ادخل دلوقتي وكمل من مكان ما وقفت! 💪`;
        break;

      case "invoice_payment":
        // data: { studentName: "Ahmed", invoiceId: "INV-123", amount: 150 }
        messageBody = `مرحباً ${data?.studentName} 💳\n\nتم تأكيد استلام المدفوعات بقيمة ${data?.amount} جنيه بنجاح (رقم ${data?.invoiceId}).\nتقدر دلوقتي تدخل المنصة وتستمتع بالكورسات!\n\nوشكراً لثقتك فينا.`;
        break;

      case "custom":
        // Allow Go backend to pass exact message
        messageBody = data?.customMessage;
        break;

      default:
        return NextResponse.json(
          { error: "Unknown automation type" },
          { status: 400 },
        );
    }

    if (!messageBody) {
      return NextResponse.json(
        { error: "Could not generate message body" },
        { status: 400 },
      );
    }

    // Attempt to send via the tenant's exact session
    await mgr.sendText(session, phone, messageBody);

    return NextResponse.json({
      success: true,
      message: "Automated message sent via tenant's WhatsApp",
      automationType,
    });
  } catch (error) {
    console.error(`[WA Automation Error] - ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
