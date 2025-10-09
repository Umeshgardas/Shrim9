// src/constants.js

// API Configuration
export const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:5000"
  : "https://shrim9.onrender.com";

// Shirt measurement fields
export const shirtFields = [
  { key: "length", label: "Length", hindiLabel: "लांबी" },
  { key: "nehru", label: "Nehru", hindiLabel: "नेहरू" },
  { key: "chest", label: "Chest", hindiLabel: "छाती" },
  { key: "stomach", label: "Stomach", hindiLabel: "पोट" },
  { key: "seat", label: "Seat", hindiLabel: "सीट" },
  { key: "front", label: "Front", hindiLabel: "समोर" },
  { key: "frontWidth", label: "Front Width", hindiLabel: "समोरची रुंदी" },
  { key: "frontDepth", label: "Front Depth", hindiLabel: "समोरची खोली" },
  { key: "shoulder", label: "Shoulder", hindiLabel: "खांदा" },
  { key: "biceps", label: "Biceps", hindiLabel: "बायसेप्स" },
  { key: "handLength", label: "Hand Length", hindiLabel: "हाताची लांबी" },
  { key: "cuff", label: "Cuff", hindiLabel: "कफ" },
  { key: "cuffLength", label: "Cuff Length", hindiLabel: "कफची लांबी" },
  { key: "collar", label: "Collar", hindiLabel: "कॉलर" },
  { key: "stand", label: "Stand", hindiLabel: "स्टँड" },
];

// Pant measurement fields
export const pantFields = [
  { key: "pantLength", label: "Length", hindiLabel: "लांबी" },
  { key: "pantSeat", label: "Seat", hindiLabel: "सीट" },
  { key: "kadda", label: "Kadda", hindiLabel: "कड्डा" },
  { key: "pantWaist", label: "Waist", hindiLabel: "कमर" },
  { key: "thies", label: "Thies", hindiLabel: "मांडी" },
  { key: "knees", label: "Knees", hindiLabel: "गुडघे" },
  { key: "cafs", label: "Cafs", hindiLabel: "पिंडळी" },
  { key: "bottom", label: "Bottom", hindiLabel: "तळ" },
];

// Garment types for dropdown
export const garmentTypes = [
  "Shirt",
  "Pant",
  "Kurta",
  "Sherwani",
  "Blazer",
  "Suit",
  "Jacket",
  "Coat",
  "Trouser",
  "Jeans",
  "T-Shirt",
  "Kurta Pajama",
  "Dhoti",
  "Waistcoat",
  "Shirt with Pant",
  "Traditional Wear",
  "Western Wear",
  "Other"
];

// Fabric types for dropdown
export const fabricTypes = [
  "Cotton",
  "Linen",
  "Silk",
  "Wool",
  "Polyester",
  "Denim",
  "Chiffon",
  "Georgette",
  "Crepe",
  "Velvet",
  "Satin",
  "Twill",
  "Canvas",
  "Corduroy",
  "Flannel",
  "Jersey",
  "Muslin",
  "Organza",
  "Taffeta",
  "Tweed",
  "Voile",
  "Brocade",
  "Other"
];