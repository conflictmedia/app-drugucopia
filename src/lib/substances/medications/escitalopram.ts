import type { Substance } from "../types";

export const escitalopram: Substance = {
  id: "escitalopram",
  name: "Escitalopram",
  commonNames: ["Escitalopram", "Lexapro", "Cipralex"],
  categories: ["medications"],
  class: "SSRI",
  description:
    "Escitalopram is a selective serotonin reuptake inhibitor (SSRI) and the pharmacologically active (S)-enantiomer of citalopram, used for major depressive disorder and generalized anxiety disorder. It is among the most selective SSRIs for the serotonin transporter, with minimal off-target effects and a low propensity for clinically significant drug interactions. Therapeutic effects typically emerge 2 to 6 weeks after starting daily therapy, although some patients report initial improvements within 1 to 2 weeks. Escitalopram has a relatively favorable cardiac profile but still carries a QT-prolongation warning at higher doses.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Generally well tolerated",
      "Low drug interaction burden",
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
      "QT prolongation at higher doses",
      "Discontinuation syndrome on abrupt cessation",
      "Risk of serotonin syndrome with serotonergic co-ingestants",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "5mg",
        light: "5-10mg",
        common: "10-20mg",
        strong: "20-30mg (caution: QT prolongation above 20mg)",
        heavy: "30mg+ (not recommended; significant QT risk)",
      },
      duration: {
        onset: "2-4 weeks (therapeutic effects)",
        comeup: "1-2 weeks (initial improvements)",
        peak: "4-8 weeks (full therapeutic effect)",
        offset: "1-2 days (per dose half-life ~27-32 hours)",
        total: "Months to years (chronic therapy)",
        afterglow: "Discontinuation may produce withdrawal symptoms lasting 1-2 weeks",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe serotonin syndrome; at least 14-day washout required",
      "Pimozide - Risk of QT prolongation and fatal arrhythmia",
      "Other SSRIs, SNRIs, and serotonergic agents - Additive risk of serotonin syndrome",
    ],
    unsafe: [
      "Tramadol - Increased risk of seizures and serotonin syndrome",
      "St. John's wort - Increased serotonergic effects and serotonin syndrome risk",
      "Linezolid / methylene blue - Reversible MAO inhibition; serotonin syndrome risk",
      "Other QT-prolonging agents (e.g., thioridazine, ziprasidone, certain antiarrhythmics) - Additive QT prolongation risk",
    ],
    uncertain: [
      "NSAIDs and aspirin - Increased bleeding risk via platelet effects",
      "CYP2C19 inhibitors (e.g., omeprazole) - Modest increase in escitalopram levels",
      "Alcohol - Additive CNS effects; may worsen depression",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Escitalopram must be taken daily for 2 to 6 weeks before full therapeutic effects are felt; it is not effective for acute symptom relief.",
    "Do not exceed 20 mg per day in most adults (10 mg in adolescents and the elderly) due to QT prolongation risk.",
    "Do not combine with MAOIs; allow at least 14 days between stopping an MAOI and starting escitalopram (and vice versa) to avoid serotonin syndrome.",
    "Be alert for signs of serotonin syndrome (agitation, sweating, tremor, hyperthermia, clonus) when combined with other serotonergic drugs.",
    "Do not stop abruptly; taper gradually under medical supervision to reduce discontinuation symptoms.",
    "Use caution with other QT-prolonging drugs and in patients with electrolyte abnormalities or congenital long QT syndrome.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C20H21FN2O",
    molecularWeight: "324.4 g/mol",
    class: "SSRI",
  },
  history:
    "Escitalopram was developed by Lundbeck and Forest Laboratories as the isolated (S)-enantiomer of citalopram, whose racemic mixture had been marketed since 1989. The single-enantiomer formulation was designed to deliver the therapeutic activity of citalopram while reducing the off-target effects of the (R)-enantiomer. Escitalopram was approved by the US FDA in 2002 and marketed under the brand names Lexapro (US) and Cipralex (Europe).",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "low",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Escitalopram",
};
