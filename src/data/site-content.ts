export const property = {
  name: "Polixeni’s House",
  location: "Agios Nikolaos, Sithonia, Halkidiki",
  address: "Sithonias, Agios Nikolaos 630 78, Greece",
  sizeSquareMetres: 70,
  bedrooms: 2,
  bathrooms: 1,
  maximumGuests: 5,
  bedLayout: ["1 double bed", "2 single beds", "1 sofa bed"],
  licenceNumber: "00002763076",
  languages: ["Greek", "English"],
  amenities: [
    "Fully equipped kitchen",
    "Private terrace",
    "Private parking",
    "Free Wi-Fi",
    "Air conditioning",
    "Washing machine",
  ],
  additionalAmenities: [
    "Flat-screen TV",
    "Refrigerator & oven",
    "Shower",
    "Hairdryer",
    "Towels & bed linen",
    "Family rooms",
  ],
  policies: {
    checkIn: "15:00–21:00",
    checkOut: "07:00–11:00",
    children: "Children of all ages are welcome.",
    cots: "A cot for children aged 0–3 is available free of charge on request, subject to availability.",
    smoking: "Smoking is not permitted.",
    parties: "Parties and events are not permitted.",
    pets: "Pets are not permitted.",
  },
  nearby: {
    villageCentreMetres: 100,
    restaurant: { name: "Makis Restaurant", distance: "150 m" },
    beaches: [
      { name: "Trani Ammouda Beach", distance: "2.7 km" },
      { name: "XANTH Beach", distance: "3.2 km" },
      { name: "Ormos Panagias Beach", distance: "4.2 km" },
      { name: "Latoura Beach", distance: "5 km" },
      { name: "Salonikiou Beach", distance: "6 km" },
    ],
    airport: { name: "Thessaloniki Airport", distance: "89 km" },
  },
  guestRatings: {
    overall: 10,
    reviewCount: 23,
    location: 9.7,
    facilities: 9.6,
  },
} as const;

export const seasonalPrices = [
  { label: "May 15–30", startMonthDay: "05-15", endMonthDay: "05-30", nightlyRate: 110 },
  { label: "June", startMonthDay: "06-01", endMonthDay: "06-30", nightlyRate: 135 },
  { label: "July", startMonthDay: "07-01", endMonthDay: "07-31", nightlyRate: 155 },
  { label: "August", startMonthDay: "08-01", endMonthDay: "08-31", nightlyRate: 175 },
  { label: "September 1–15", startMonthDay: "09-01", endMonthDay: "09-15", nightlyRate: 135 },
  { label: "September 16–30", startMonthDay: "09-16", endMonthDay: "09-30", nightlyRate: 120 },
] as const;

export const guestTestimonials = [
  { name: "Portan", country: "Belgium", countryEl: "Βέλγιο", text: "The apartment felt exceptionally clean and spacious, with everything needed close to the village’s restaurants and shops.", textEl: "Το διαμέρισμα ήταν εξαιρετικά καθαρό και ευρύχωρο, πλήρως εξοπλισμένο και κοντά στα εστιατόρια και τα καταστήματα του χωριού." },
  { name: "Nina", country: "Bulgaria", countryEl: "Βουλγαρία", text: "A welcoming, thoughtfully designed and well-equipped home; having a car makes exploring the surrounding beaches especially easy.", textEl: "Ένα φιλόξενο, όμορφα σχεδιασμένο και καλά εξοπλισμένο σπίτι· με αυτοκίνητο οι γύρω παραλίες εξερευνώνται πολύ εύκολα." },
  { name: "Lindsay", country: "France", countryEl: "Γαλλία", text: "A comfortable place to stay, made even better by Xenia’s genuinely warm welcome.", textEl: "Ένας άνετος χώρος διαμονής, ακόμη πιο όμορφος χάρη στο πραγματικά θερμό καλωσόρισμα της Ξένιας." },
  { name: "Marek", country: "Slovakia", countryEl: "Σλοβακία", text: "Agios Nikolaos was a convenient base for beaches on both sides of Sithonia, and the apartment offered plenty of space.", textEl: "Ο Άγιος Νικόλαος ήταν ιδανική βάση για τις παραλίες και στις δύο πλευρές της Σιθωνίας, ενώ το διαμέρισμα είχε άφθονο χώρο." },
  { name: "Irina", country: "Bulgaria", countryEl: "Βουλγαρία", text: "A pretty, cosy family home with all the practical details covered and thoughtful welcome touches on arrival.", textEl: "Ένα όμορφο και ζεστό οικογενειακό σπίτι, με όλα τα πρακτικά που χρειάζεσαι και προσεγμένες λεπτομέρειες καλωσορίσματος." },
  { name: "Petar", country: "Bulgaria", countryEl: "Βουλγαρία", text: "Very clean and comfortable, only a few steps from the tavernas, with a friendly and responsive host.", textEl: "Πολύ καθαρό και άνετο, λίγα μόλις βήματα από τις ταβέρνες, με φιλική και άμεσα διαθέσιμη οικοδέσποινα." },
  { name: "Lilia1971", country: "Bulgaria", countryEl: "Βουλγαρία", text: "The spotless, spacious apartment, private parking and generous terrace made this an especially memorable stay.", textEl: "Η άψογη καθαριότητα, οι μεγάλοι χώροι, το ιδιωτικό πάρκινγκ και η άνετη βεράντα έκαναν τη διαμονή πραγματικά ξεχωριστή." },
  { name: "Peter", country: "Bulgaria", countryEl: "Βουλγαρία", text: "The apartment matched its description, was fully equipped and made village life easy, including parking directly outside.", textEl: "Το διαμέρισμα ανταποκρινόταν πλήρως στην περιγραφή, ήταν ολοκληρωμένα εξοπλισμένο και είχε βολικό πάρκινγκ ακριβώς έξω." },
  { name: "Sorin", country: "Romania", countryEl: "Ρουμανία", text: "A strong choice for a family: two practical bedrooms, a large kitchen and living room, patio and nearby parking.", textEl: "Εξαιρετική επιλογή για οικογένεια, με δύο πρακτικά υπνοδωμάτια, μεγάλη κουζίνα και καθιστικό, αυλή και κοντινό πάρκινγκ." },
  { name: "Dijana", country: "Austria", countryEl: "Αυστρία", text: "Modern, beautifully clean and well equipped, in an excellent location with a kind welcome from the host.", textEl: "Μοντέρνο, πεντακάθαρο και πλήρως εξοπλισμένο, σε εξαιρετική τοποθεσία και με πολύ ευγενικό καλωσόρισμα." },
] as const;

export const migrationBoundary = {
  sourceIncludesBookingShortcodes: true,
  sourceIncludesBookingDatabase: false,
  separateLegacyDatabaseDumpProvided: true,
  legacyReservationsRequireAuditBeforeImport: true,
} as const;
