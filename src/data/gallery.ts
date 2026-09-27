export const propertyGallery = [
  ...Array.from({ length: 27 }, (_, index) => {
    const number = 29 - index;
    return { src: `/images/property/polixenis-house-picture-${number}.jpg`, alt: `Polixeni’s House interior and outdoor space — view ${number}` };
  }),
  { src: "/images/property/polixenis-house-beds.png", alt: "Bedroom at Polixeni’s House" },
  { src: "/images/property/polixenis-house-baseroom.png", alt: "Living space at Polixeni’s House" },
  { src: "/images/property/polixenis-house-beds-white-room.png", alt: "White bedroom at Polixeni’s House" },
] as const;

export const homeGallery = [propertyGallery[0], propertyGallery[4], propertyGallery[8], propertyGallery[13], propertyGallery[18]];
