import nodemailer from "nodemailer";

export type ReservationMail = {
  requestId: string;
  arrivalDate: string;
  departureDate: string;
  guests: number;
  nights: number;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerMessage?: string;
};

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export function smtpConfiguration() {
  const values = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE !== "false",
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    fromName: process.env.SMTP_FROM_NAME || "Polixeni's House",
    bookingToEmail: process.env.BOOKING_TO_EMAIL,
  };
  if (!values.host || !values.user || !values.password || !values.fromEmail || !values.bookingToEmail || !Number.isInteger(values.port)) return null;
  return values as typeof values & { host: string; user: string; password: string; fromEmail: string; bookingToEmail: string };
}

export function smtpTransport(configuration: NonNullable<ReturnType<typeof smtpConfiguration>>) {
  return nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure,
    auth: { user: configuration.user, pass: configuration.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

export async function sendReservationEmails(input: ReservationMail) {
  const configuration = smtpConfiguration();
  if (!configuration) return { configured: false, ownerSent: false, guestSent: false };
  const transport = smtpTransport(configuration);
  const name = cleanHeader(input.customerName);
  const reference = input.requestId.slice(0, 8).toUpperCase();
  const total = new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(input.totalCents / 100);
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(input.customerEmail),
    phone: escapeHtml(input.customerPhone || "—"),
    message: escapeHtml(input.customerMessage || "—").replace(/\r?\n/g, "<br>"),
  };
  const owner = transport.sendMail({
    from: { name: configuration.fromName, address: configuration.fromEmail },
    to: configuration.bookingToEmail,
    replyTo: { name, address: input.customerEmail },
    subject: `New reservation request · ${input.arrivalDate} · ${reference}`,
    text: [`Reference: ${reference}`, `Guest: ${name}`, `Email: ${input.customerEmail}`, `Telephone: ${input.customerPhone || "—"}`, `Stay: ${input.arrivalDate} to ${input.departureDate}`, `Guests: ${input.guests}`, `Nights: ${input.nights}`, `Indicative total: ${total}`, "", "Message:", input.customerMessage || "—"].join("\n"),
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171714"><h1>New reservation request</h1><p><strong>Reference:</strong> ${reference}</p><p><strong>Guest:</strong> ${safe.name}<br><strong>Email:</strong> ${safe.email}<br><strong>Telephone:</strong> ${safe.phone}</p><p><strong>Stay:</strong> ${input.arrivalDate} to ${input.departureDate}<br><strong>Guests:</strong> ${input.guests}<br><strong>Nights:</strong> ${input.nights}<br><strong>Indicative total:</strong> ${total}</p><p><strong>Message:</strong><br>${safe.message}</p><p>This request is pending. Confirm it in the private administration area before treating the dates as reserved.</p></div>`,
  });
  const guest = transport.sendMail({
    from: { name: configuration.fromName, address: configuration.fromEmail },
    to: { name, address: input.customerEmail },
    replyTo: configuration.bookingToEmail,
    subject: `We received your request · Polixeni's House · ${reference}`,
    text: [`Hello ${name},`, "", `We received your request for ${input.arrivalDate} to ${input.departureDate}.`, `Reference: ${reference}`, `Indicative total: ${total}`, "", "Your dates are not reserved yet. We will contact you after checking availability.", "", "Polixeni's House"].join("\n"),
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171714"><h1>Thank you, ${safe.name}.</h1><p>We received your request for <strong>${input.arrivalDate} to ${input.departureDate}</strong>.</p><p><strong>Reference:</strong> ${reference}<br><strong>Indicative total:</strong> ${total}</p><p>Your dates are not reserved yet. We will contact you after checking availability.</p><p>Polixeni's House</p></div>`,
  });
  const [ownerResult, guestResult] = await Promise.allSettled([owner, guest]);
  return { configured: true, ownerSent: ownerResult.status === "fulfilled", guestSent: guestResult.status === "fulfilled" };
}
