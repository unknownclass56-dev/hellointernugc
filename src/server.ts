import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseUrl = "https://prnrdlmmplmxrptdhmfj.supabase.co";
const supabaseAnonKey = "sb_publishable_wqG_8g8c8qIwUPDJDNVx8A_Wi2cA1Hh";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      
      if (url.pathname === "/api/send-email") {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "POST, OPTIONS"
            }
          });
        }
        
        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Only POST requests are allowed" }), {
            status: 405,
            headers: { 
              "content-type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        
        try {
          const body: any = await request.json();
          const { to, subject, html } = body;
          
          if (!to || !subject || !html) {
            return new Response(JSON.stringify({ error: "Missing required fields: to, subject, html" }), {
              status: 400,
              headers: { 
                "content-type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            });
          }

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "email-techlaunchpad01@gmail.com",
              pass: "oahjqhatwddgeiig"
            }
          });

          const info = await transporter.sendMail({
            from: '"TechLaunchpad" <email-techlaunchpad01@gmail.com>',
            to,
            subject,
            html
          });

          console.log(`Email successfully sent to ${to}: ${info.messageId}`);
          return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
            status: 200,
            headers: { 
              "content-type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        } catch (err: any) {
          console.error("Failed to send email:", err);
          return new Response(JSON.stringify({ error: err.message || "Failed to send email" }), {
            status: 500,
            headers: { 
              "content-type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }

      if (url.pathname === "/api/webhook") {
        if (request.method === "GET") {
          return new Response("Webhook receiver is active. Send POST request with JSON payload.", {
            status: 200,
            headers: { "content-type": "text/plain" }
          });
        }
        if (request.method === "POST") {
          try {
            const body: any = await request.json();
            console.log("Razorpay Webhook Triggered:", body.event);

          if (body.event === "payment.captured") {
            const payment = body.payload.payment.entity;
            const email = payment.email;
            const contact = payment.contact;
            const amount = payment.amount / 100; // in INR
            const transactionId = payment.id;

            console.log(`Payment captured event received in webhook: ${email}, ${contact}, ₹${amount}, ID: ${transactionId}`);

            // Lookup unclaimed lead by email
            let { data: lead, error: leadError } = await supabase
              .from("leads").select("*").eq("email", email)
              .eq("is_claimed", false)
              .maybeSingle();

            if (!lead && contact) {
              // Try to lookup by contact number if email match didn't find anything
              const cleanPhone = contact.replace(/[^0-9]/g, "");
              const last10 = cleanPhone.slice(-10);

              const { data: phoneLeads } = await supabase
                .from("leads").select("*").eq("is_claimed", false);

              lead = (phoneLeads || []).find((l: any) => {
                const lPhone = (l.contact_number || "").replace(/[^0-9]/g, "");
                return lPhone.endsWith(last10);
              });
            }

            if (leadError) {
              console.error("Error fetching lead in webhook:", leadError);
              return new Response(JSON.stringify({ error: leadError.message }), { 
                status: 500,
                headers: { "content-type": "application/json" }
              });
            }

            if (lead) {
              console.log(`Matching lead found for webhook: ${lead.full_name} (${lead.id})`);

              // 1. Create Supabase Auth User
              const tempClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
              const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: lead.email,
                password: lead.raw_password,
                options: {
                  data: {
                    full_name: lead.full_name,
                    role: "student",
                    raw_password: lead.raw_password
                  }
                }
              });

              if (authError) {
                // Handle case where user is already registered in Auth but profile is missing
                if (authError.message.includes("already registered") || authError.status === 422) {
                  console.log(`User already exists in Auth. Checking profile...`);
                  
                  const { data: existingProfile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("email", lead.email)
                    .maybeSingle();

                  if (existingProfile) {
                    // Update lead and log payment
                    await supabase.from("leads").update({ is_claimed: true }).eq("id", lead.id);
                    await supabase.from("pre_registrations").update({ is_claimed: true }).eq("university_roll_number", lead.university_roll_number);
                    
                    const { data: existingPay } = await supabase
                      .from("payments")
                      .select("id")
                      .eq("slip_url", `https://dashboard.razorpay.com/app/payments/${transactionId}`)
                      .maybeSingle();

                    if (!existingPay) {
                      const newPayment = {
                        student_id: existingProfile.id,
                        amount: amount,
                        status: "Paid",
                        slip_url: `https://dashboard.razorpay.com/app/payments/${transactionId}`,
                        created_at: new Date().toISOString()
                      };
                      await supabase.from("payments").insert([newPayment]);
                    }

                    return new Response(JSON.stringify({ success: true, message: "Lead claimed for existing user" }), {
                      status: 200,
                      headers: { "content-type": "application/json" }
                    });
                  }
                }

                console.error("Auth signUp error in webhook:", authError);
                return new Response(JSON.stringify({ error: authError.message }), { 
                  status: 500,
                  headers: { "content-type": "application/json" }
                });
              }

              // 2. Create student profile
              const profileData: any = {
                id: authData.user?.id,
                full_name: lead.full_name,
                email: lead.email,
                contact_number: lead.contact_number,
                university_name: lead.university_name,
                college_name: lead.college_name,
                gender: lead.gender,
                parent_name: lead.parent_name,
                degree: lead.degree,
                department: lead.department,
                semester: lead.semester,
                academic_session: lead.academic_session,
                university_roll_number: lead.university_roll_number,
                program: lead.program,
                role: "student",
                raw_password: lead.raw_password,
                created_at: new Date().toISOString()
              };

              const { error: profileError } = await supabase.from("profiles").insert([profileData]);
              if (profileError) {
                console.error("Profile insert error in webhook:", profileError);
                return new Response(JSON.stringify({ error: profileError.message }), { 
                  status: 500,
                  headers: { "content-type": "application/json" }
                });
              }

              // 3. Mark lead as claimed
              await supabase.from("leads").update({ is_claimed: true }).eq("id", lead.id);
              await supabase.from("pre_registrations").update({ is_claimed: true }).eq("university_roll_number", lead.university_roll_number);

              // 4. Record successful payment
              const newPayment = {
                student_id: authData.user?.id,
                amount: amount,
                status: "Paid",
                slip_url: `https://dashboard.razorpay.com/app/payments/${transactionId}`,
                created_at: new Date().toISOString()
              };
              await supabase.from("payments").insert([newPayment]);

              console.log(`Webhook processing succeeded! Account activated for ${email}`);
              return new Response(JSON.stringify({ success: true, message: "Webhook activation completed" }), { 
                status: 200,
                headers: { "content-type": "application/json" }
              });
            } else {
              console.log(`No unclaimed lead found for ${email}/${contact}. Skipping.`);
              return new Response(JSON.stringify({ success: true, message: "Lead already claimed or not found" }), { 
                status: 200,
                headers: { "content-type": "application/json" }
              });
            }
          }

          return new Response(JSON.stringify({ received: true }), { 
            status: 200,
            headers: { "content-type": "application/json" }
          });
        } catch (err: any) {
          console.error("Webhook processing failed:", err);
          return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "content-type": "application/json" }
          });
        }
      }
    }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
