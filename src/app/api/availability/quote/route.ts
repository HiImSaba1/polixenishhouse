import { InvalidStayError, quoteAvailableStay, UnavailableStayError } from "@/features/booking/service";
import { stayRequestSchema } from "@/features/booking/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) {
    return Response.json({ message: "Request is too large." }, { status: 413 });
  }

  const parsed = stayRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "Choose valid dates and guest count." }, { status: 400 });

  try {
    const quote = await quoteAvailableStay(parsed.data);
    return Response.json({ nights: quote.nights, totalCents: quote.totalCents });
  } catch (error) {
    if (error instanceof UnavailableStayError) return Response.json({ message: error.message }, { status: 409 });
    if (error instanceof InvalidStayError) return Response.json({ message: error.message }, { status: 422 });
    console.error("Availability quote failed.", error);
    return Response.json({ message: "Availability could not be checked right now." }, { status: 503 });
  }
}
