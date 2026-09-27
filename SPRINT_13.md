# Sprint 13 — Verified property information

The public content now follows the currently published Booking.com listing for Polixeni's House without copying Booking.com's editorial wording.

## Corrected facts

- Private 70 m² apartment in Agios Nikolaos, Sithonia.
- Two bedrooms, one bathroom and capacity for five guests.
- Bed layout: one double bed, two single beds and one sofa bed.
- Fully equipped kitchen, refrigerator, oven, washing machine and flat-screen TV.
- Private terrace, free private parking, Wi-Fi and air conditioning.
- Check-in 15:00–21:00; check-out 07:00–11:00.
- Children of all ages are welcome; a free cot for ages 0–3 is available on request and subject to availability.
- No smoking, parties/events or pets.
- Greek and English host communication.
- Property licence `00002763076`.
- Verified location and nearby-distance summaries.
- Booking.com rating summary: 10/10 from 23 reviews, location 9.7 and facilities 9.6 at the time of review.

Guest comments are summarized rather than reproduced verbatim.

## Scroll reliability

- Load Lenis's required global stylesheet.
- Allow the document root to use its measured content height instead of forcing `height: 100%`.
- Reset Lenis's internal position on route changes and refresh GSAP ScrollTrigger measurements.
- Keep page-transition scroll resets in one owner so native and smooth-scroll state cannot diverge.

## Capacity migration

Migration `0002_correct_guest_capacity.sql` changes the database default and existing seasonal rules from six guests to the verified maximum of five.

Owner-run gates:

```powershell
npm run db:migrate
npm run db:verify
npm run verify:sprint-13
```

Run the commands in order. The database verifier must report three applied migrations and `Maximum guests: 5` before testing the public form.
