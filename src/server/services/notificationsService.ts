/**
 * Notifications Service - Phase 2
 * Slack webhooks, email sending, event management
 */

import { query } from "../db/pool";

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
          await this.sendSlack(event, config.config);
        } else if (config.type === "email") {
          await this.sendEmail(event, config.config);
        } else if (config.type === "webhook") {
          await this.sendWebhook(event, config.config);
        }
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  }

  /**
   * Send Slack notification
   * Phase 2 implementation
   */
  private static async sendSlack(
    event: NotificationEvent,
    config: Record<string, any>
  ): Promise<void> {
    const webhookUrl = config.webhookUrl;
    if (!webhookUrl) {
      console.warn("Slack webhook URL not configured");
      return;
    }

    const message = this.formatSlackMessage(event);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error(`Slack webhook failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Slack send error:", error);
    }
  }

  /**
   * Send email notification
   * Phase 2 implementation
   */
  private static async sendEmail(
    event: NotificationEvent,
    config: Record<string, any>
  ): Promise<void> {
    const emailList = config.emails || [];
    if (emailList.length === 0) {
      console.warn("No email recipients configured");
      return;
    }

    // TODO: Implement email service integration
    // This would use Resend, SendGrid, or similar
    console.log(`Would send email to ${emailList.join(", ")} for event ${event.type}`);
  }

  /**
   * Send to custom webhook
   * Phase 2 implementation
   */
  private static async sendWebhook(
    event: NotificationEvent,
    config: Record<string, any>
  ): Promise<void> {
    const webhookUrl = config.url;
    if (!webhookUrl) {
      console.warn("Webhook URL not configured");
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.error(`Webhook failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Webhook send error:", error);
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
