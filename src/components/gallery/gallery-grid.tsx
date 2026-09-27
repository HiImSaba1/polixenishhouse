import { ParallaxImage } from "@/components/motion/parallax-image";

export function GalleryGrid({ images, limit }: { images: readonly { src: string; alt: string }[]; limit?: number }) {
  return <div className="gallery-grid">{images.slice(0, limit).map((image, index) => <ParallaxImage key={image.src} {...image} sizes={index % 5 === 0 ? "(max-width: 700px) 100vw, 65vw" : "(max-width: 700px) 100vw, 35vw"} />)}</div>;
}
