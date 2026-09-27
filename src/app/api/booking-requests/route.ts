import { createBookingRequest, InvalidStayError, UnavailableStayError } from "@/features/booking/service";
import { bookingRequestSchema } from "@/features/booking/validation";
import { sendReservationEmails } from "@/lib/email/smtp";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map<string, { count: number; resetsAt: number }>();

function isRateLimited(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetsAt <= now) {
    attempts.set(key, { count: 1, resetsAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ message: "Request origin is not allowed." }, { status: 403 });
  if (isRateLimited(request)) return Response.json({ message: "Too many requests. Please try again later." }, { status: 429 });
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) {
    return Response.json({ message: "Request is too large." }, { status: 413 });
  }

  const parsed = bookingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "Check the reservation details and try again." }, { status: 400 });

  try {
    const result = await createBookingRequest(parsed.data);
    const notification = await sendReservationEmails({ requestId: result.id, arrivalDate: parsed.data.arrivalDate, departureDate: parsed.data.departureDate, guests: parsed.data.guests, nights: result.nights, totalCents: result.totalCents, customerName: parsed.data.customerName, customerEmail: parsed.data.customerEmail, customerPhone: parsed.data.customerPhone, customerMessage: parsed.data.customerMessage });
    if (notification.configured && (!notification.ownerSent || !notification.guestSent)) console.error("Reservation saved, but one or more email notifications failed.");
    return Response.json({ requestId: result.id, nights: result.nights, totalCents: result.totalCents, notification }, { status: 201 });
  } catch (error) {
    if (error instanceof UnavailableStayError) return Response.json({ message: error.message }, { status: 409 });
    if (error instanceof InvalidStayError) return Response.json({ message: error.message }, { status: 422 });
    console.error("Reservation request failed.", error);
    return Response.json({ message: "The request could not be saved right now." }, { status: 503 });
  }
}
