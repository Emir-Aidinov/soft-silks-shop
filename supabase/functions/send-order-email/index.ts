import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderId: string;
  email: string;
  type: "created" | "status_updated";
  status?: string;
  total?: number;
  userId?: string;
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "В ожидании",
    processing: "В обработке",
    completed: "Завершён",
    cancelled: "Отменён",
  };
  return labels[status] || status;
};

const getEmailSubject = (type: string, status?: string): string => {
  if (type === "created") {
    return "Бесценки: Ваш заказ принят! 💝";
  }
  return `Бесценки: Статус заказа изменён на "${getStatusLabel(status || "")}"`;
};

const getEmailHtml = (type: string, orderId: string, status?: string, total?: number): string => {
  if (type === "created") {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; }
          .logo { font-size: 24px; font-weight: bold; color: #e91e63; }
          .content { padding: 30px 0; }
          .order-box { background: #fce4ec; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .order-id { font-size: 14px; color: #666; }
          .total { font-size: 24px; font-weight: bold; color: #e91e63; }
          .footer { text-align: center; padding: 20px 0; border-top: 2px solid #f0f0f0; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💝 Бесценки</div>
          </div>
          <div class="content">
            <h1>Спасибо за заказ!</h1>
            <p>Мы получили ваш заказ и уже начали его обрабатывать.</p>
            <div class="order-box">
              <p class="order-id">Номер заказа: #${orderId.slice(0, 8)}</p>
              ${total ? `<p class="total">${total.toLocaleString("ru-RU")} сом</p>` : ""}
            </div>
            <p>Мы уведомим вас, когда статус заказа изменится.</p>
            <p>Если у вас есть вопросы, свяжитесь с нами!</p>
          </div>
          <div class="footer">
            <p>С любовью, команда Бесценки 💝</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  const statusLabel = getStatusLabel(status || "");
  const statusColor = status === "completed" ? "#4caf50" : status === "cancelled" ? "#f44336" : "#ff9800";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; }
        .logo { font-size: 24px; font-weight: bold; color: #e91e63; }
        .content { padding: 30px 0; }
        .status-box { background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
        .status { font-size: 20px; font-weight: bold; color: ${statusColor}; }
        .order-id { font-size: 14px; color: #666; margin-top: 10px; }
        .footer { text-align: center; padding: 20px 0; border-top: 2px solid #f0f0f0; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💝 Бесценки</div>
        </div>
        <div class="content">
          <h1>Статус вашего заказа обновлён</h1>
          <div class="status-box">
            <p class="status">${statusLabel}</p>
            <p class="order-id">Заказ #${orderId.slice(0, 8)}</p>
          </div>
          ${status === "completed" ? "<p>Ваш заказ готов! Спасибо за покупку! 🎉</p>" : ""}
          ${status === "cancelled" ? "<p>К сожалению, ваш заказ был отменён. Если у вас есть вопросы, свяжитесь с нами.</p>" : ""}
          ${status === "processing" ? "<p>Мы уже работаем над вашим заказом!</p>" : ""}
        </div>
        <div class="footer">
          <p>С любовью, команда Бесценки 💝</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, email, type, status, total, userId }: OrderEmailRequest = await req.json();

    console.log(`Sending ${type} email for order ${orderId} to ${email}`);

    // Send push notification if user has a subscription
    if (userId && type === "status_updated") {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: subscription } = await supabase
          .from("push_subscriptions")
          .select("subscription")
          .eq("user_id", userId)
          .maybeSingle();

        if (subscription) {
          console.log("User has push subscription, sending notification");
          // Push notifications are handled client-side via service worker
          // Here we just log that subscription exists
        }
      } catch (pushError) {
        console.error("Error checking push subscription:", pushError);
        // Don't fail the request if push check fails
      }
    }

    if (!email) {
      console.log("No email provided, skipping");
      return new Response(JSON.stringify({ message: "No email provided" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Бесценки <onboarding@resend.dev>",
        to: [email],
        subject: getEmailSubject(type, status),
        html: getEmailHtml(type, orderId, status, total),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
