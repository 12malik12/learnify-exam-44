
import { subjects } from "./subjects";

export interface ExamQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  subject_id: string;
  unit_objective?: string;
}

// Sample questions organized by subject
// In a real app, this would be a much larger dataset
// loaded from JSON files or local storage
const questionsBySubject: Record<string, ExamQuestion[]> = {
  "math": [
    {
      id: "math-seq-1",
      question_text: "A geometric sequence has a first term of 4 and a common ratio of 3. What is the sum of the first 6 terms?",
      option_a: "364",
      option_b: "1092",
      option_c: "1456",
      option_d: "4368",
      correct_answer: "B",
      explanation: "For a geometric sequence with first term a and common ratio r, the sum of the first n terms is given by: S_n = a(1-r^n)/(1-r). With a=4, r=3, and n=6: S_6 = 4(1-3^6)/(1-3) = 4(1-729)/(-2) = 4(728)/2 = 1456.",
      subject_id: "math"
    },
    {
      id: "math-seq-2",
      question_text: "In an arithmetic sequence, the 5th term is 13 and the 10th term is 28. Find the 20th term.",
      option_a: "43",
      option_b: "53",
      option_c: "58",
      option_d: "63",
      correct_answer: "C",
      explanation: "For an arithmetic sequence, we need to find the common difference d. If a_5 = 13 and a_10 = 28, then a_10 - a_5 = 5d, so 28 - 13 = 5d, thus d = 3. Now, a_5 = a_1 + 4d = 13, so a_1 = 13 - 4(3) = 1. Now, a_20 = a_1 + 19d = 1 + 19(3) = 1 + 57 = 58.",
      subject_id: "math"
    },
    {
      id: "math-seq-3",
      question_text: "A sequence is defined recursively as a_1 = 3, a_n = 2a_{n-1} + 1 for n ≥ 2. Find a_5.",
      option_a: "31",
      option_b: "63",
      option_c: "95",
      option_d: "127",
      correct_answer: "C",
      explanation: "We compute successive terms: a_1 = 3, a_2 = 2(3) + 1 = 7, a_3 = 2(7) + 1 = 15, a_4 = 2(15) + 1 = 31, a_5 = 2(31) + 1 = 63.",
      subject_id: "math"
    },
    {
      id: "math-matrix-1",
      question_text: "If A = \\begin{pmatrix} 2 & 1 \\\\ 3 & 4 \\end{pmatrix} and B = \\begin{pmatrix} 0 & 2 \\\\ 1 & 3 \\end{pmatrix}, find det(AB).",
      option_a: "det(A) · det(B)",
      option_b: "det(A) + det(B)",
      option_c: "det(A) - det(B)",
      option_d: "det(B) - det(A)",
      correct_answer: "A",
      explanation: "A fundamental property of determinants is that det(AB) = det(A) · det(B). We have det(A) = 2·4 - 1·3 = 5 and det(B) = 0·3 - 2·1 = -2. Thus, det(AB) = det(A) · det(B) = 5 · (-2) = -10.",
      subject_id: "math"
    },
    {
      id: "math-stat-1",
      question_text: "A dataset has a mean of 50 and standard deviation of 10. If each value in the dataset is increased by 5, what happens to the coefficient of variation?",
      option_a: "It increases",
      option_b: "It decreases",
      option_c: "It remains the same",
      option_d: "It becomes zero",
      correct_answer: "B",
      explanation: "The coefficient of variation (CV) is defined as the ratio of the standard deviation to the mean, expressed as a percentage: CV = (σ/μ) × 100%. When each value is increased by 5, the mean becomes 55 while the standard deviation remains 10. Thus, the new CV = (10/55) × 100%, which is smaller than the original CV = (10/50) × 100%. Therefore, the coefficient of variation decreases.",
      subject_id: "math"
    }
  ],
  "physics": [
    {
      id: "phys-fluids-1",
      question_text: "A cylindrical tube is partially filled with water. When the tube is rotated about its axis at a constant angular velocity ω, the water forms a paraboloid. What is the height difference between the water at the center and at a distance r from the center?",
      option_a: "ω²r/2g",
      option_b: "ω²r²/2g",
      option_c: "ω²r/g",
      option_d: "ω²r²/g",
      correct_answer: "B",
      explanation: "In a rotating fluid, the shape of the free surface is a paraboloid given by the equation h = ω²r²/2g, where h is the height difference between the water at radius r and at the center, ω is the angular velocity, and g is the acceleration due to gravity.",
      subject_id: "physics"
    },
    {
      id: "phys-em-1",
      question_text: "A solenoid of length 20 cm has 400 turns and carries a current of 2 A. What is the magnitude of the magnetic field inside the solenoid?",
      option_a: "2.51 × 10⁻³ T",
      option_b: "5.03 × 10⁻³ T",
      option_c: "1.26 × 10⁻² T",
      option_d: "2.51 × 10⁻² T",
      correct_answer: "B",
      explanation: "The magnetic field inside a solenoid is given by B = μ₀nI, where μ₀ = 4π × 10⁻⁷ T·m/A is the permeability of free space, n is the number of turns per unit length, and I is the current. Here, n = 400/0.2 = 2000 turns/m, I = 2 A. So B = 4π × 10⁻⁷ × 2000 × 2 = 5.03 × 10⁻³ T.",
      subject_id: "physics"
    },
    {
      id: "phys-em-2",
      question_text: "A copper ring is placed horizontally in a region with a uniform vertical magnetic field. If the magnetic field begins to decrease at a constant rate of 0.2 T/s, what happens to the ring?",
      option_a: "It moves upward due to an induced current",
      option_b: "It moves downward due to an induced current",
      option_c: "It heats up but doesn't move",
      option_d: "Nothing happens to the ring",
      correct_answer: "A",
      explanation: "According to Faraday's law, a changing magnetic field induces an EMF in the ring, creating a current. By Lenz's law, this current produces a magnetic field opposing the change. As the external field decreases, the induced current creates an upward magnetic force on the ring, causing it to move upward.",
      subject_id: "physics"
    }
  ],
  "chemistry": [
    {
      id: "chem-acid-base-1",
      question_text: "A buffer solution is prepared by mixing 0.2 M CH₃COOH and 0.3 M CH₃COONa. If the pKa of acetic acid is 4.76, what is the pH of this buffer?",
      option_a: "4.16",
      option_b: "4.46",
      option_c: "4.76",
      option_d: "5.06",
      correct_answer: "D",
      explanation: "For a buffer containing a weak acid and its conjugate base, pH = pKa + log([base]/[acid]). In this case, pH = 4.76 + log(0.3/0.2) = 4.76 + log(1.5) = 4.76 + 0.18 = 4.94, closest to option D.",
      subject_id: "chemistry"
    },
    {
      id: "chem-electrochem-1", 
      question_text: "In an electrolytic cell used for copper refining, what mass of copper (in grams) will be deposited when a current of 2.0 A flows for 1.0 hour? (Atomic mass of Cu = 63.5 g/mol, F = 96500 C/mol)",
      option_a: "2.37 g",
      option_b: "4.74 g",
      option_c: "7.11 g",
      option_d: "9.48 g",
      correct_answer: "A",
      explanation: "Using Faraday's law: m = (I × t × M)/(n × F), where m is the mass deposited, I is the current, t is the time, M is the molar mass, n is the number of electrons transferred (n = 2 for Cu²⁺ → Cu), and F is Faraday's constant. m = (2.0 A × 3600 s × 63.5 g/mol)/(2 × 96500 C/mol) = 2.37 g.",
      subject_id: "chemistry"
    },
    {
      id: "chem-polymer-1",
      question_text: "Which of the following polymers is formed by a condensation polymerization reaction?",
      option_a: "Polyethylene",
      option_b: "Polystyrene",
      option_c: "Polyvinyl chloride",
      option_d: "Nylon-6,6",
      correct_answer: "D",
      explanation: "Nylon-6,6 is formed by the condensation polymerization of hexamethylenediamine and adipic acid. During this reaction, water molecules are eliminated as the monomers combine. In contrast, polyethylene, polystyrene, and polyvinyl chloride are all formed by addition polymerization reactions where no small molecules are eliminated.",
      subject_id: "chemistry"
    }
  ],
  "biology": [
    {
      id: "bio-genetics-1",
      question_text: "In a dihybrid cross between AaBb × AaBb, what is the probability of obtaining offspring with genotype aabb?",
      option_a: "1/4",
      option_b: "1/8",
      option_c: "1/16",
      option_d: "3/16",
      correct_answer: "C",
      explanation: "For each heterozygous gene (Aa or Bb), the probability of passing the recessive allele (a or b) is 1/2. In a dihybrid cross AaBb × AaBb, the probability of getting aa is 1/4 (1/2 × 1/2), and the probability of getting bb is also 1/4. The probability of getting both aa and bb together (aabb) is 1/4 × 1/4 = 1/16.",
      subject_id: "biology"
    },
    {
      id: "bio-cell-1",
      question_text: "A student is examining a cell under a microscope and notices that it lacks membrane-bound organelles. What other characteristic would confirm that this is a prokaryotic cell?",
      option_a: "Presence of a cell wall made of peptidoglycan",
      option_b: "Presence of membrane-bound ribosomes",
      option_c: "DNA enclosed in a nuclear envelope",
      option_d: "Complex endomembrane system",
      correct_answer: "A",
      explanation: "Prokaryotic cells lack membrane-bound organelles including a nucleus. They typically have a cell wall composed of peptidoglycan, which is a distinctive feature of prokaryotes, particularly bacteria. Other characteristics like the absence of a nuclear envelope, the presence of free ribosomes (not membrane-bound), and the absence of an endomembrane system also distinguish prokaryotes from eukaryotes.",
      subject_id: "biology"
    },
    {
      id: "bio-enzymes-1",
      question_text: "An enzyme's activity is measured at different temperatures. The graph of reaction rate versus temperature initially increases, peaks, and then sharply decreases. What causes the decrease in enzyme activity at high temperatures?",
      option_a: "Reduced substrate concentration",
      option_b: "Inhibitor binding to the active site",
      option_c: "Protein denaturation disrupting the enzyme's structure",
      option_d: "Decreased molecular collision frequency",
      correct_answer: "C",
      explanation: "At high temperatures, the increased thermal energy disrupts the weak non-covalent bonds (hydrogen bonds, ionic interactions, and hydrophobic interactions) that maintain the enzyme's three-dimensional structure. This denaturation alters the shape of the active site, preventing proper substrate binding and catalysis, resulting in decreased enzyme activity.",
      subject_id: "biology"
    }
  ]
};

// Add more questions here for other subjects

// Function to get questions by subject ID
export const getQuestionsBySubject = (subjectId: string): ExamQuestion[] => {
  return questionsBySubject[subjectId] || [];
};

// Function to get all available questions
export const getAllQuestions = (): ExamQuestion[] => {
  return Object.values(questionsBySubject).flat();
};

// Function to get question count by subject
export const getQuestionCountBySubject = (subjectId: string): number => {
  return (questionsBySubject[subjectId] || []).length;
};

// Get total question count
export const getTotalQuestionCount = (): number => {
  return getAllQuestions().length;
};
