import type { Substance } from "../types";

export const buspirone: Substance = {
  id: "buspirone",
  name: "Buspirone",
  commonNames: ["Buspirone", "BuSpar"],
  categories: ["medications"],
  class: "Azapirone",
  description:
    "Buspirone is an anxiolytic medication primarily used to treat generalized anxiety disorder (GAD). Unlike benzodiazepines, buspirone acts as a 5-HT1A receptor partial agonist and does not exert its effects through the GABA system. Consequently, it lacks sedative, muscle-relaxant, and anticonvulsant properties, and carries no significant risk of physical dependence or withdrawal. A defining characteristic of buspirone is its delayed onset of therapeutic action; while acute doses reach peak plasma levels quickly, the clinical anxiolytic effects typically require 2 to 4 weeks of daily dosing to fully manifest. It is also used off-label as an augmentation agent for depression.",
  effects: {
    positive: [
      "Anxiety suppression (with chronic use)",
      "Mood stabilization (with chronic use)",
      "Lack of sedation",
      "No cognitive or psychomotor impairment",
      "No physical dependence or withdrawal syndrome",
    ],
    neutral: [
      "Delayed onset of therapeutic action",
      "Mild dizziness",
      "Lightheadedness",
      "Restlessness",
      "Mild nausea",
    ],
    negative: [
      "Headaches",
      "Nausea",
      "Insomnia",
      "Dysphoria (at high doses)",
      "Drowsiness",
      "Takes weeks to achieve full effect",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "5mg",
        light: "7.5-15mg",
        common: "15-30mg",
        strong: "30-60mg",
        heavy: "60mg+",
      },
      duration: {
        onset: "20-40 minutes",
        comeup: "40-90 minutes",
        peak: "1-2 hours",
        offset: "2-4 hours",
        total: "4-6 hours",
        afterglow: "Unknown",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe hypertensive crisis",
    ],
    unsafe: [
      "Grapefruit juice - Significantly increases plasma concentrations of buspirone, leading to increased adverse effects",
      "Alcohol - Additive CNS depression",
    ],
    uncertain: [
      "SSRIs/SNRIs - Rare risk of serotonin syndrome",
      "CYP3A4 inhibitors (e.g., erythromycin, itraconazole, ketoconazole) - Increased plasma levels of buspirone",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Buspirone is not effective for acute, panic-level anxiety. It must be taken consistently every day for 2 to 4 weeks before therapeutic anxiolytic effects are felt.",
    "Concurrent use with MAOIs is strictly contraindicated due to the risk of dangerously high blood pressure. A washout period of at least 14 days is required between stopping an MAOI and starting buspirone.",
    "Avoid consuming large amounts of grapefruit juice while taking buspirone, as it inhibits CYP3A4 metabolism and can drastically increase drug levels in the body.",
    "Buspirone cannot be used as a direct substitute for benzodiazepines during acute alcohol or benzodiazepine withdrawal, as it does not act on the GABA receptors.",
    "Although buspirone has a very low potential for abuse, taking excessively high doses can result in severe nausea, vomiting, dizziness, and dysphoria rather than euphoria.",
    "Use with caution in patients with severe hepatic or renal impairment, as the drug's metabolism and clearance may be significantly reduced, requiring dosage adjustments.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C21H31N5O2",
    molecularWeight: "385.5 g/mol",
    class: "Azapirone",
  },
  history:
    "Buspirone was first synthesized in 1968 and patented in 1975. It was initially developed as an antipsychotic but was found to be ineffective for psychosis. However, researchers noted its unique anxiolytic properties without the sedative and dependence-producing effects typical of benzodiazepines, leading to its eventual approval by the FDA in 1986 for the treatment of generalized anxiety disorder.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "low",
  psychonautWikiUrl: "https://psychonautwiki.org/wiki/Buspirone",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Buspirone",
};
