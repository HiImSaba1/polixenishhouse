import Link from "next/link";

export function Wordmark({ light = false }: { light?: boolean }) {
  return <Link className={`wordmark${light ? " wordmark--light" : ""}`} href="/" aria-label="Polixeni’s House — home"><span className="wordmark__name">Polixeni’s</span><span className="wordmark__place">House · Halkidiki</span></Link>;
}
