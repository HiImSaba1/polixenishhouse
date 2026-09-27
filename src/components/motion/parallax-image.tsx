"use client";

import Image from "next/image";
import { ParallaxMedia } from "@/components/motion/parallax-media";

type Props = { src: string; alt: string; priority?: boolean; sizes?: string; className?: string };

export function ParallaxImage({ src, alt, priority = false, sizes = "100vw", className = "" }: Props) {
  return <ParallaxMedia className={`parallax-image ${className}`}><Image src={src} alt={alt} fill priority={priority} sizes={sizes} /></ParallaxMedia>;
}
