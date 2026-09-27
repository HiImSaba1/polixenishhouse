const origin = new URL(process.env.PRODUCTION_SITE_URL ?? "https://polixenishouse.gr");
const checks = [
  { path: "/api/health/live", json: "live" },
  { path: "/api/health/ready", json: "ready" },
  { path: "/", contains: "Polixeni" },
  { path: "/the-house", contains: "Το Σπίτι" },
  { path: "/availability", contains: "Διαθεσιμότητα" },
  { path: "/contact", contains: "Επικοινωνία" },
  { path: "/en", contains: "A home for all" },
  { path: "/en/availability", contains: "Availability" },
];

let failed = false;
for (const check of checks) {
  const url = new URL(check.path, origin);
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10_000) });
    const body = await response.text();
    const contentOk = check.json ? JSON.parse(body).status === check.json : body.includes(check.contains);
    const ok = response.ok && contentOk;
    console.log(`${ok ? "PASS" : "FAIL"} - ${check.path}: HTTP ${response.status}`);
    if (!ok) failed = true;
  } catch (error) {
    failed = true;
    console.log(`FAIL - ${check.path}: ${error instanceof Error ? error.message : "request failed"}`);
  }
}
if (failed) process.exitCode = 1;
