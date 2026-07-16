import type { Substance } from "../types";

export const citalopram: Substance = {
  id: "citalopram",
  name: "Citalopram",
  commonNames: ["Citalopram", "Celexa", "Cipramil"],
  categories: ["medications"],
  class: "SSRI",
  description:
    "Citalopram is a selective serotonin reuptake inhibitor (SSRI) used primarily for major depressive disorder and, off-label, for anxiety disorders including panic and OCD. It is a racemic mixture of (R)- and (S)-enantiomers, with the serotonin reuptake inhibition residing almost entirely in the (S)-enantiomer (escitalopram). Therapeutic antidepressant effects typically emerge 2 to 6 weeks after starting daily therapy. Citalopram carries a dose-dependent risk of QT prolongation and Torsades de Pointes, leading the FDA to issue a safety communication in 2011 restricting the maximum recommended dose to 40 mg per day.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Improved sleep in depressed patients",
      "Generally well tolerated",
      "Reduced depressive rumination",
    ],
    neutral: [
      "Delayed onset of therapeutic action (2-6 weeks)",
      "Mild gastrointestinal upset",
      "Yawning",
      "Vivid dreams",
      "Sweating",
    ],
    negative: [
      "Sexual dysfunction (anorgasmia, decreased libido)",
      "Nausea and dry mouth",
      "Insomnia or somnolence",
      "QT prolongation at higher doses (dose-dependent)",
      "Discontinuation syndrome on abrupt cessation",
      "Risk of serotonin syndrome with serotonergic co-ingestants",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "10mg",
        light: "10-20mg",
        common: "20-40mg",
        strong: "40-60mg (caution: QT prolongation above 40mg)",
        heavy: "60mg+ (not recommended; significant QT risk)",
      },
      duration: {
        onset: "2-4 weeks (therapeutic effects)",
        comeup: "1-2 weeks (initial improvements)",
        peak: "4-8 weeks (full therapeutic effect)",
        offset: "1-2 days (per dose half-life ~35 hours)",
        total: "Months to years (chronic therapy)",
        afterglow: "Discontinuation may produce withdrawal symptoms lasting 1-2 weeks",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe serotonin syndrome; at least 14-day washout required",
      "Other QT-prolonging agents (e.g., pimozide, thioridazine, ziprasidone, certain antiarrhythmics) - Additive QT prolongation and Torsades de Pointes risk",
      "Other SSRIs, SNRIs, and serotonergic agents - Additive risk of serotonin syndrome",
    ],
    unsafe: [
      "Tramadol - Increased risk of seizures and serotonin syndrome",
      "St. John's wort - Increased serotonergic effects and serotonin syndrome risk",
      "Linezolid / methylene blue - Reversible MAO inhibition; serotonin syndrome risk",
      "Drugs that impair CYP2C19 (e.g., omeprazole, fluconazole) - Increased citalopram levels and QT risk",
    ],
    uncertain: [
      "NSAIDs and aspirin - Increased bleeding risk via platelet effects",
      "Alcohol - Additive CNS effects; may worsen depression",
      "Lithium - Possible serotonergic potentiation",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Citalopram must be taken daily for 2 to 6 weeks before full therapeutic effects are felt; it is not effective for acute symptom relief.",
    "Do not exceed 40 mg per day in adults (20 mg in patients over 60, those with hepatic impairment, or CYP2C19 poor metabolizers) due to dose-dependent QT prolongation risk.",
    "Do not combine with MAOIs; allow at least 14 days between stopping an MAOI and starting citalopram (and vice versa) to avoid serotonin syndrome.",
    "Be alert for signs of serotonin syndrome (agitation, sweating, tremor, hyperthermia, clonus) when combined with other serotonergic drugs.",
    "Do not stop abruptly; taper gradually under medical supervision to reduce discontinuation symptoms.",
    "Use caution with other QT-prolonging drugs and in patients with electrolyte abnormalities, bradycardia, or congenital long QT syndrome.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C20H21FN2O",
    molecularWeight: "324.4 g/mol",
    class: "SSRI",
  },
  history:
    "Citalopram was first synthesized in 1972 by the Danish pharmaceutical company Lundbeck and was first marketed in Denmark in 1989 under the brand name Cipramil. It was approved by the US FDA in 1998 and marketed by Forest Laboratories as Celexa. The (S)-enantiomer, escitalopram, was subsequently isolated and developed as a separate drug and launched in 2002.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Citalopram",
};
