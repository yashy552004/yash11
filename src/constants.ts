import { Medicine } from './types';

export const INITIAL_MEDS: Partial<Medicine>[] = [
  {
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    description: "Used to treat various bacterial infections.",
    price: 15.99,
    stock: 100,
    requiresPrescription: true,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    dosage: "One capsule three times a day."
  },
  {
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    description: "Commonly used for pain relief and fever reduction.",
    price: 4.50,
    stock: 500,
    requiresPrescription: false,
    imageUrl: "https://images.unsplash.com/photo-1550572017-ed2002b4227d?w=400&q=80",
    dosage: "1-2 tablets every 4-6 hours."
  },
  {
    name: "Lisinopril 10mg",
    category: "Blood Pressure",
    description: "Used to treat high blood pressure and heart failure.",
    price: 22.00,
    stock: 50,
    requiresPrescription: true,
    imageUrl: "https://images.unsplash.com/photo-1471864190281-ad5fe9ac59db?w=400&q=80",
    dosage: "Once daily in the morning."
  },
  {
    name: "Cetirizine 10mg",
    category: "Allergy",
    description: "Antihistamine used to treat hay fever and allergies.",
    price: 8.75,
    stock: 200,
    requiresPrescription: false,
    imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&q=80",
    dosage: "One tablet daily."
  },
  {
    name: "Metformin 500mg",
    category: "Diabetes",
    description: "Helps control blood sugar levels in people with type 2 diabetes.",
    price: 12.30,
    stock: 150,
    requiresPrescription: true,
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80",
    dosage: "Two tablets daily with meals."
  }
];
