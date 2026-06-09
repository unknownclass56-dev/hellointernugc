import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// Crypto for server-side Razorpay payment verification
import crypto from "crypto";

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

// Razorpay secret for server-side signature verification
const razorpaySecret = "ZXeWWgHpCF9C9M6sLEQE7Wpz";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      let ssrRequest = request;
      const url = new URL(request.url);

      // Rewrite subdomain trainings.domain.com to domain.com/trainings internally
      const hostParts = url.hostname.split(".");
      if (hostParts.includes("trainings")) {
        const pathname = url.pathname;
        if (
          !pathname.startsWith("/api") &&
          !pathname.startsWith("/_build") &&
          !pathname.startsWith("/_server") &&
          !pathname.startsWith("/__vite_ping") &&
          !pathname.startsWith("/@") &&
          !pathname.startsWith("/src") &&
          !pathname.startsWith("/node_modules") &&
          !/\.[a-zA-Z0-9]+$/.test(pathname)
        ) {
          let targetPath = pathname;
          if (!targetPath.startsWith("/trainings")) {
            if (targetPath === "/") {
              targetPath = "/trainings";
            } else {
              targetPath = `/trainings${targetPath}`;
            }
          }
          
          const port = url.port ? `:${url.port}` : "";
          const mainDomainParts = hostParts.filter(p => p !== "trainings" && p !== "www");
          const mainDomain = mainDomainParts.join(".") || "localhost";
          const isLocal = url.hostname.includes("localhost") || url.hostname.includes("127.0.0.1") || url.hostname.includes("::1");
          const protocol = isLocal ? "http:" : "https:";
          const targetUrl = `${protocol}//${mainDomain}${port}${targetPath}${url.search}`;
          
          ssrRequest = new Request(targetUrl, request);
        }
      }


      // ────────────────────────────────────────────
      // /api/send-email
      // ────────────────────────────────────────────
      if (url.pathname === "/api/send-email") {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
          });
        }

        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Only POST requests are allowed" }), {
            status: 405,
            headers: {
              "content-type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
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
                "Access-Control-Allow-Origin": "*",
              },
            });
          }

          const typedEnv = (env || {}) as Record<string, string>;
          const smtpUser = typedEnv.SMTP_USER || (typeof process !== "undefined" && process.env ? process.env.SMTP_USER : "") || "techlaunchpad01@gmail.com";
          const smtpPass = typedEnv.SMTP_PASS || (typeof process !== "undefined" && process.env ? process.env.SMTP_PASS : "") || "oahjqhatwddgeiig";

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          const info = await transporter.sendMail({
            from: `"TechLaunchpad" <${smtpUser}>`,
            to,
            subject,
            html,
          });

          console.log(`Email successfully sent to ${to}: ${info.messageId}`);
          return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
            status: 200,
            headers: {
              "content-type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (err: any) {
          console.error("Failed to send email:", err);
          return new Response(JSON.stringify({ error: err.message || "Failed to send email" }), {
            status: 500,
            headers: {
              "content-type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      // ────────────────────────────────────────────
      // /api/verify-payment  (server-side Razorpay signature check)
      // ────────────────────────────────────────────
      if (url.pathname === "/api/verify-payment") {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
          });
        }

        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Only POST allowed" }), {
            status: 405,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        try {
          const body: any = await request.json();
          const { order_id, payment_id, signature } = body;

          // If signature & order_id are provided, do signature verification
          if (order_id && signature) {
            const expected = crypto
              .createHmac("sha256", razorpaySecret)
              .update(`${order_id}|${payment_id}`)
              .digest("hex");

            if (expected !== signature) {
              console.error(`Payment signature mismatch for payment ${payment_id}`);
              return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
                status: 400,
                headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
              });
            }
            console.log(`Payment signature verified successfully: ${payment_id}`);
            return new Response(JSON.stringify({ success: true, message: "Payment verified" }), {
              status: 200,
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }

          // Otherwise, perform direct server-side API verification & capture
          if (!payment_id) {
            return new Response(JSON.stringify({ error: "Missing required field: payment_id" }), {
              status: 400,
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }

          const keyId = "rzp_live_SrD6N9ylebiBCT";
          const keySecret = "yVUQfJrrTUuINPDXkATMCNsF";
          
          const authHeader = "Basic " + btoa(`${keyId}:${keySecret}`);
          const fetchUrl = `https://api.razorpay.com/v1/payments/${payment_id}`;
          
          const payRes = await fetch(fetchUrl, {
            headers: { "Authorization": authHeader }
          });
          
          if (!payRes.ok) {
            const errText = await payRes.text();
            console.error("Razorpay fetch error:", errText);
            return new Response(JSON.stringify({ error: "Failed to fetch payment details from Razorpay" }), {
              status: 400,
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }
          
          const payment = await payRes.json();
          
          if (payment.status === "authorized") {
            const captureUrl = `https://api.razorpay.com/v1/payments/${payment_id}/capture`;
            const capRes = await fetch(captureUrl, {
              method: "POST",
              headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                amount: payment.amount,
                currency: payment.currency || "INR"
              })
            });
            
            if (!capRes.ok) {
              const errText = await capRes.text();
              console.error("Razorpay capture error:", errText);
              return new Response(JSON.stringify({ error: "Failed to capture payment" }), {
                status: 400,
                headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
              });
            }
            
            console.log(`Payment captured successfully via API: ${payment_id}`);
          } else if (payment.status !== "captured") {
            return new Response(JSON.stringify({ error: `Payment is in invalid state: ${payment.status}` }), {
              status: 400,
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }

          console.log(`Payment verified and captured: ${payment_id}`);
          return new Response(JSON.stringify({ 
            success: true, 
            message: "Payment verified and captured",
            amount: payment.amount / 100
          }), {
            status: 200,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        } catch (err: any) {
          console.error("Payment verification error:", err);
          return new Response(JSON.stringify({ error: err.message || "Verification failed" }), {
            status: 500,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      }

      // ────────────────────────────────────────────
      // /api/capture-all-authorized (Capture all authorized payments in Razorpay)
      // ────────────────────────────────────────────
      if (url.pathname === "/api/capture-all-authorized") {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
          });
        }

        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Only POST allowed" }), {
            status: 405,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        try {
          const keyId = "rzp_live_SrD6N9ylebiBCT";
          const keySecret = "yVUQfJrrTUuINPDXkATMCNsF";
          const authHeader = "Basic " + btoa(`${keyId}:${keySecret}`);

          // Fetch the latest 100 payments
          const listUrl = "https://api.razorpay.com/v1/payments?count=100";
          const listRes = await fetch(listUrl, {
            headers: { "Authorization": authHeader }
          });

          if (!listRes.ok) {
            const errText = await listRes.text();
            console.error("Razorpay list payments error:", errText);
            return new Response(JSON.stringify({ error: "Failed to fetch payments from Razorpay" }), {
              status: 400,
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }

          const data = await listRes.json();
          const payments = data.items || [];
          const authorizedPayments = payments.filter((p: any) => p.status === "authorized");

          let successCount = 0;
          let failCount = 0;
          const details = [];

          for (const payment of authorizedPayments) {
            try {
              const captureUrl = `https://api.razorpay.com/v1/payments/${payment.id}/capture`;
              const capRes = await fetch(captureUrl, {
                method: "POST",
                headers: {
                  "Authorization": authHeader,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  amount: payment.amount,
                  currency: payment.currency || "INR"
                })
              });

              if (capRes.ok) {
                successCount++;
                details.push({ id: payment.id, status: "captured", amount: payment.amount / 100 });
              } else {
                failCount++;
                const errText = await capRes.text();
                details.push({ id: payment.id, status: "failed", error: errText });
              }
            } catch (err: any) {
              failCount++;
              details.push({ id: payment.id, status: "error", error: err.message });
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              totalFound: authorizedPayments.length,
              captured: successCount,
              failed: failCount,
              details
            }),
            {
              status: 200,
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            }
          );
        } catch (err: any) {
          console.error("Capture all authorized error:", err);
          return new Response(JSON.stringify({ error: err.message || "Execution failed" }), {
            status: 500,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      }

      // ────────────────────────────────────────────
      // /api/webhook  (Razorpay webhook for internship payments)
      // ────────────────────────────────────────────
      if (url.pathname === "/api/webhook") {
        if (request.method === "GET") {
          return new Response("Webhook receiver is active. Send POST request with JSON payload.", {
            status: 200,
            headers: { "content-type": "text/plain" },
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
                .from("leads")
                .select("*")
                .eq("email", email)
                .eq("is_claimed", false)
                .maybeSingle();

              if (!lead && contact) {
                // Try to lookup by contact number if email match didn't find anything
                const cleanPhone = contact.replace(/[^0-9]/g, "");
                const last10 = cleanPhone.slice(-10);

                const { data: phoneLeads } = await supabase
                  .from("leads")
                  .select("*")
                  .eq("is_claimed", false);

                lead = (phoneLeads || []).find((l: any) => {
                  const lPhone = (l.contact_number || "").replace(/[^0-9]/g, "");
                  return lPhone.endsWith(last10);
                });
              }

              if (leadError) {
                console.error("Error fetching lead in webhook:", leadError);
                return new Response(JSON.stringify({ error: leadError.message }), {
                  status: 500,
                  headers: { "content-type": "application/json" },
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
                      raw_password: lead.raw_password,
                    },
                  },
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
                      await supabase
                        .from("pre_registrations")
                        .update({ is_claimed: true })
                        .eq("university_roll_number", lead.university_roll_number);

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
                          created_at: new Date().toISOString(),
                        };
                        await supabase.from("payments").insert([newPayment]);
                      }

                      return new Response(JSON.stringify({ success: true, message: "Lead claimed for existing user" }), {
                        status: 200,
                        headers: { "content-type": "application/json" },
                      });
                    }
                  }

                  console.error("Auth signUp error in webhook:", authError);
                  return new Response(JSON.stringify({ error: authError.message }), {
                    status: 500,
                    headers: { "content-type": "application/json" },
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
                  created_at: new Date().toISOString(),
                };

                const { error: profileError } = await supabase.from("profiles").insert([profileData]);
                if (profileError) {
                  console.error("Profile insert error in webhook:", profileError);
                  return new Response(JSON.stringify({ error: profileError.message }), {
                    status: 500,
                    headers: { "content-type": "application/json" },
                  });
                }

                // 3. Mark lead as claimed
                await supabase.from("leads").update({ is_claimed: true }).eq("id", lead.id);
                await supabase
                  .from("pre_registrations")
                  .update({ is_claimed: true })
                  .eq("university_roll_number", lead.university_roll_number);

                // 4. Record successful payment
                const newPayment = {
                  student_id: authData.user?.id,
                  amount: amount,
                  status: "Paid",
                  slip_url: `https://dashboard.razorpay.com/app/payments/${transactionId}`,
                  created_at: new Date().toISOString(),
                };
                await supabase.from("payments").insert([newPayment]);

                console.log(`Webhook processing succeeded! Account activated for ${email}`);
                return new Response(JSON.stringify({ success: true, message: "Webhook activation completed" }), {
                  status: 200,
                  headers: { "content-type": "application/json" },
                });
              } else {
                console.log(`No unclaimed lead found for ${email}/${contact}. Skipping.`);
                return new Response(JSON.stringify({ success: true, message: "Lead already claimed or not found" }), {
                  status: 200,
                  headers: { "content-type": "application/json" },
                });
              }
            }

            return new Response(JSON.stringify({ received: true }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          } catch (err: any) {
            console.error("Webhook processing failed:", err);
            return new Response(JSON.stringify({ error: err.message }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }
        }
      }

      // Fall through to SSR handler
      const handler = await getServerEntry();
      const response = await handler.fetch(ssrRequest, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
