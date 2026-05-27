/**
 * Notifications Service - Phase 2
 * Slack webhooks, email sending, event management
 */

import { query } from "../db/pool.ts";
import { Resend } from "resend";

// SSRF protection: validate webhook URLs
function validateWebhookUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "[::1]") return null;
    // Block private IP ranges
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) return null;
    // Block metadata endpoints
    if (/^(169\.254\.)/.test(hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

export interface NotificationEvent {
  type: "scan.completed" | "scan.failed" | "plan.limit_exceeded" | "subscription.expiring";
  orgId: string;
  data: Record<string, any>;
}

export class NotificationsService {
  /**
   * Send notification to configured channels
   */
  static async sendNotification(event: NotificationEvent): Promise<void> {
    try {
      // Get notification configs for org
      const { rows } = await query(
        `SELECT type, config, enabled FROM notifications_config
         WHERE org_id = $1 AND enabled = true`,
        [event.orgId]
      );

      if (!rows || rows.length === 0) {
        console.log(`No notifications configured for org ${event.orgId}`);
        return;
      }

      // Send to each configured channel
      for (const config of rows) {
        if (config.type === "slack") {
          await this.sendSlack(event.orgId, event, config.config);
        } else if (config.type === "email") {
          await this.sendEmail(event.orgId, event, config.config);
        } else if (config.type === "webhook") {
          await this.sendWebhook(event.orgId, event, config.config);
        }
      }
    } catch (error) {
      console.error(`[notifications] [orgId:${event.orgId}] Error sending notifications:`, error);
    }
  }

  /**
   * Send Slack notification
   * Phase 2 implementation
   */
  private static async sendSlack(
    orgId: string,
    event: NotificationEvent,
    config: Record<string, any>
  ): Promise<void> {
    const webhookUrl = config.webhookUrl;
    if (!webhookUrl) {
      console.warn("Slack webhook URL not configured");
      return;
    }

    const validatedUrl = validateWebhookUrl(webhookUrl);
    if (!validatedUrl) {
      console.error(`[notifications] [orgId:${orgId}] Invalid Slack webhook URL (must be HTTPS public endpoint)`);
      return;
    }

    const message = this.formatSlackMessage(event);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(validatedUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
          signal: controller.signal,
        });

        if (!response.ok) {
          console.error(`[notifications] [orgId:${orgId}] Slack webhook failed: ${response.status} ${response.statusText}`);
        }
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      console.error(`[notifications] [orgId:${orgId}] Slack send error:`, error);
    }
  }

  /**
   * Send email notification
   * Phase 2 implementation
   */
  private static async sendEmail(
    orgId: string,
    event: NotificationEvent,
    config: Record<string, any>
  ): Promise<void> {
    const rawEmails = config.emails || [];
    const emailList = Array.isArray(rawEmails) ? rawEmails : [String(rawEmails)];
    if (emailList.length === 0) {
      console.warn("No email recipients configured");
      return;
    }

    try {
      const emailContent = this.formatEmailContent(event);
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: emailList,
        subject: emailContent.subject,
        html: emailContent.body,
      });
      
      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }
      
      console.log(`[notifications] [orgId:${orgId}] Email sent successfully to ${emailList.join(", ")} for event ${event.type}`);
    } catch (error) {
      console.error(`[notifications] [orgId:${orgId}] Failed to send email:`, error);
      throw error; // Re-throw to be caught by sendNotification
    }
  }

    /**
     * Format event into email content
     */
    private static formatEmailContent(
      event: NotificationEvent
    ): { subject: string; body: string } {
      const baseUrl = process.env.FRONTEND_URL || "https://grader.dev";
      
      switch (event.type) {
        case "scan.completed":
          return {
            subject: `✅ Scan Complete: ${event.data.owner}/${event.data.repo}`,
            body: `
              <h2>Repository Scan Completed</h2>
              <p><strong>${event.data.owner}/${event.data.repo}</strong> has been successfully scanned.</p>
              <ul>
                <li><strong>Score:</strong> ${event.data.score}/100</li>
                <li><strong>Grade:</strong> ${event.data.grade}</li>
                <li><strong>Completed:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              <p>View your full report: <a href="${baseUrl}/report/${event.data.owner}/${event.data.repo}">${baseUrl}/report/${event.data.owner}/${event.data.repo}</a></p>
            `,
          };

        case "scan.failed":
          return {
            subject: `❌ Scan Failed: ${event.data.owner}/${event.data.repo}`,
            body: `
              <h2>Repository Scan Failed</h2>
              <p><strong>${event.data.owner}/${event.data.repo}</strong> scan encountered an error.</p>
              <p><strong>Error:</strong> ${event.data.error || "Unknown error"}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `,
          };

        case "plan.limit_exceeded":
          return {
            subject: `⚠️ Monthly Scan Limit Reached`,
            body: `
              <h2>Monthly Scan Limit Exceeded</h2>
              <p>You've used ${event.data.used}/${event.data.limit} scans this month.</p>
              <p><strong>Reset Date:</strong> ${new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                1
              ).toLocaleDateString()}</p>
              <p>View your usage: <a href="${baseUrl}/dashboard">${baseUrl}/dashboard</a></p>
              <p>Upgrade your plan: <a href="${baseUrl}/upgrade">${baseUrl}/upgrade</a></p>
            `,
          };

        case "subscription.expiring":
          return {
            subject: `⏰ Subscription Renewal Reminder`,
            body: `
              <h2>Subscription Renewal Reminder</h2>
              <p>Your subscription is set to renew soon.</p>
              <p><strong>Plan:</strong> ${event.data.planTier}</p>
              <p><strong>Renewal Date:</strong> ${new Date(
                event.data.renewalDate
              ).toLocaleDateString()}</p>
              <p>Manage your subscription: <a href="${baseUrl}/billing">${baseUrl}/billing</a></p>
            `,
          };

        default:
          return {
            subject: `Grader Notification`,
            body: `<p>You have received a notification from Grader.</p>`,
          };
      }
    }

    /**
     * Send to custom webhook
     * Phase 2 implementation
     */
  private static async sendWebhook(
    orgId: string,
    event: NotificationEvent,
    config: Record<string, any>
  ): Promise<void> {
    const webhookUrl = config.url;
    if (!webhookUrl) {
      console.warn("Webhook URL not configured");
      return;
    }

    const validatedUrl = validateWebhookUrl(webhookUrl);
    if (!validatedUrl) {
      console.error(`[notifications] [orgId:${orgId}] Invalid webhook URL (must be HTTPS public endpoint)`);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(validatedUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
          signal: controller.signal,
        });

        if (!response.ok) {
          console.error(`[notifications] [orgId:${orgId}] Webhook failed: ${response.status} ${response.statusText}`);
        }
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      console.error(`[notifications] [orgId:${orgId}] Webhook send error:`, error);
    }
  }

  /**
   * Format event into Slack message
   */
  private static formatSlackMessage(event: NotificationEvent): Record<string, any> {
    const baseMessage = {
      username: "Grader",
      icon_emoji: ":robot_face:",
    };

    switch (event.type) {
      case "scan.completed":
        return {
          ...baseMessage,
          text: `✅ Repository scan completed`,
          attachments: [
            {
              color: "good",
              title: `${event.data.owner}/${event.data.repo}`,
              fields: [
                {
                  title: "Score",
                  value: `${event.data.score}/100`,
                  short: true,
                },
                {
                  title: "Grade",
                  value: event.data.grade,
                  short: true,
                },
              ],
              actions: [
                {
                  type: "button",
                  text: "View Report",
                  url: `https://grader.dev/report/${event.data.owner}/${event.data.repo}`,
                },
              ],
            },
          ],
        };

      case "scan.failed":
        return {
          ...baseMessage,
          text: `❌ Repository scan failed`,
          attachments: [
            {
              color: "danger",
              title: `${event.data.owner}/${event.data.repo}`,
              text: event.data.error || "Unknown error",
            },
          ],
        };

      case "plan.limit_exceeded":
        return {
          ...baseMessage,
          text: `⚠️ Monthly scan limit reached`,
          attachments: [
            {
              color: "warning",
              text: `You've used ${event.data.used}/${event.data.limit} scans this month.`,
              actions: [
                {
                  type: "button",
                  text: "Upgrade Plan",
                  url: `https://grader.dev/upgrade`,
                },
              ],
            },
          ],
        };

      default:
        return baseMessage;
    }
  }
}
