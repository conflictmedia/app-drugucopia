import type { Substance } from "../types";

export const fluvoxamine: Substance = {
  id: "fluvoxamine",
  name: "Fluvoxamine",
  commonNames: ["Fluvoxamine", "Luvox", "Faverin", "Luvox CR"],
  categories: ["medications"],
  class: "SSRI",
  description:
    "Fluvoxamine is a selective serotonin reuptake inhibitor (SSRI) indicated for obsessive-compulsive disorder and, in some markets, depression and anxiety disorders. It was in fact the first SSRI to reach the market, introduced in Switzerland in 1983, predating fluoxetine's US launch. Therapeutic effects typically emerge after 2 to 6 weeks of continuous daily dosing. Fluvoxamine is a potent inhibitor of CYP1A2 and also inhibits CYP2C19 and CYP3A4, giving it a clinically significant drug-interaction profile that distinguishes it from other SSRIs.",
  effects: {
    positive: [
      "Reduction of obsessive and intrusive thoughts (in OCD)",
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Improved sleep continuity",
      "Reduced panic attack frequency",
    ],
    neutral: [
      "Delayed onset of therapeutic action (2-6 weeks)",
      "Sedation or somnolence (more pronounced than other SSRIs)",
      "Mild gastrointestinal upset",
      "Vivid dreams",
      "Sweating",
    ],
    negative: [
      "Sexual dysfunction (anorgasmia, decreased libido)",
      "Nausea and diarrhea",
      "Insomnia or somnolence",
      "Significant CYP1A2-mediated drug interactions",
      "Discontinuation syndrome on abrupt cessation",
      "Risk of serotonin syndrome with serotonergic co-ingestants",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "25mg",
        light: "25-50mg",
        common: "50-150mg",
        strong: "150-300mg",
        heavy: "300mg+",
      },
      duration: {
        onset: "2-4 weeks (therapeutic effects)",
        comeup: "1-2 weeks (initial improvements)",
        peak: "4-8 weeks (full therapeutic effect)",
        offset: "1 day (per dose half-life ~15.6 hours)",
        total: "Months to years (chronic therapy)",
        afterglow: "Discontinuation may produce withdrawal symptoms lasting 1-2 weeks",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe serotonin syndrome; at least 14-day washout required",
      "Tizanidine - Fluvoxamine potently inhibits CYP1A2, dramatically raising tizanidine levels and causing severe hypotension and bradycardia",
      "Other SSRIs, SNRIs, and serotonergic agents - Additive risk of serotonin syndrome",
    ],
    unsafe: [
      "Tramadol - Increased risk of seizures and serotonin syndrome",
      "St. John's wort - Increased serotonergic effects and serotonin syndrome risk",
      "Linezolid / methylene blue - Reversible MAO inhibition; serotonin syndrome risk",
      "Theophylline, clozapine, and other CYP1A2 substrates - Markedly elevated levels due to potent CYP1A2 inhibition",
      "Warfarin - Elevated levels and bleeding risk (CYP1A2/CYP2C19 inhibition)",
    ],
    uncertain: [
      "NSAIDs and aspirin - Increased bleeding risk via platelet effects",
      "Alcohol - Additive CNS effects; may worsen depression",
      "Caffeine - Reduced clearance; possible jitteriness and insomnia",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Fluvoxamine must be taken daily for 2 to 6 weeks before full therapeutic effects are felt; it is not effective for acute symptom relief.",
    "Do not combine with MAOIs; allow at least 14 days between stopping an MAOI and starting fluvoxamine (and vice versa) to avoid serotonin syndrome.",
    "Fluvoxamine is a potent CYP1A2 inhibitor; avoid co-prescription with tizanidine, theophylline, clozapine, and other narrow-therapeutic-index CYP1A2 substrates.",
    "Be alert for signs of serotonin syndrome (agitation, sweating, tremor, hyperthermia, clonus) when combined with other serotonergic drugs.",
    "Do not stop abruptly; taper gradually under medical supervision to reduce discontinuation symptoms.",
    "Take at bedtime if sedation is prominent; consider dose titration in 50 mg increments every 4-7 days.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C15H21F3N2O2",
    molecularWeight: "318.3 g/mol",
    class: "SSRI",
  },
  history:
    "Fluvoxamine was developed by the Belgian pharmaceutical company Solvay and was first marketed in Switzerland in 1983 under the brand name Floxyfral, making it the first SSRI to reach the market anywhere in the world. It was approved by the US FDA in 1997 specifically for obsessive-compulsive disorder and marketed as Luvox. Although never as widely prescribed as fluoxetine or sertraline, fluvoxamine retains a niche in OCD treatment and was repopularized during the COVID-19 pandemic due to research into its anti-inflammatory effects.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "low",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Fluvoxamine",
};
