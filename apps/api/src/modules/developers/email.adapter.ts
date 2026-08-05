import { Injectable, Logger } from "@nestjs/common";
import type { EmailPort } from "../../common/ports";

@Injectable()
export class ResendEmailAdapter implements EmailPort {
  private readonly logger = new Logger(ResendEmailAdapter.name);

  async sendMagicLink(email: string, url: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.log(`Magic link for ${email}: ${url}`);
      return;
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.RESEND_FROM_EMAIL ?? "CrystoDolar <noreply@example.com>",
        to: [email],
        subject: "Tu acceso a CrystoDolar",
        html: `<p>Confirma tu correo para crear tu API key de CrystoDolar.</p><p><a href="${url}">Continuar</a></p><p>Este enlace vence en 15 minutos.</p>`,
      }),
    });
    if (!response.ok) throw new Error(`Resend failed: ${response.status}`);
  }
}
