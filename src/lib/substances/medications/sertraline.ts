import type { Substance } from "../types";

export const sertraline: Substance = {
  id: "sertraline",
  name: "Sertraline",
  commonNames: ["Sertraline", "Zoloft", "Lustral"],
  categories: ["medications"],
  class: "SSRI",
  description:
    "Sertraline is a selective serotonin reuptake inhibitor (SSRI) widely prescribed for major depressive disorder, obsessive-compulsive disorder, panic disorder, post-traumatic stress disorder, social anxiety disorder, and premenstrual dysphoric disorder. It acts by potently blocking the presynaptic serotonin transporter (SERT), increasing serotonin availability in the synaptic cleft, with minimal affinity for dopamine or norepinephrine transporters. Therapeutic effects typically emerge after 2 to 6 weeks of continuous daily dosing, even though peak plasma concentrations are reached within hours. Sertraline has a relatively favorable cardiac safety profile compared to tricyclic antidepressants, and discontinuation should be gradual to avoid withdrawal symptoms such as dizziness, nausea, and paresthesias.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Reduced intrusive thoughts (in OCD)",
      "Improved sleep architecture over weeks",
      "Decreased panic attack frequency",
    ],
    neutral: [
      "Delayed onset of therapeutic action (2-6 weeks)",
      "Mild gastrointestinal upset",
      "Changes in appetite",
      "Vivid or unusual dreams",
      "Sweating",
    ],
    negative: [
      "Sexual dysfunction (anorgasmia, decreased libido)",
      "Nausea and diarrhea",
      "Insomnia or somnolence",
      "Weight gain or weight loss",
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
        common: "50-100mg",
        strong: "100-200mg",
        heavy: "200mg+",
      },
      duration: {
        onset: "2-4 weeks (therapeutic effects)",
        comeup: "1-2 weeks (initial improvements)",
        peak: "4-8 weeks (full therapeutic effect)",
        offset: "1-2 weeks (per dose half-life ~26 hours)",
        total: "Months to years (chronic therapy)",
        afterglow: "Discontinuation may produce withdrawal symptoms lasting 1-2 weeks",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe serotonin syndrome; at least 14-day washout required",
      "Pimozide - Risk of QT prolongation and cardiac arrhythmia",
      "Other SSRIs, SNRIs, and serotonergic agents - Additive risk of serotonin syndrome",
    ],
    unsafe: [
      "Tramadol - Increased risk of seizures and serotonin syndrome",
      "St. John's wort - Increased serotonergic effects and serotonin syndrome risk",
      "Linezolid / methylene blue - Reversible MAO inhibition; serotonin syndrome risk",
      "Warfarin - Altered bleeding risk due to platelet serotonin depletion",
    ],
    uncertain: [
      "NSAIDs and aspirin - Increased bleeding risk via platelet effects",
      "CYP2D6 substrates (e.g., beta-blockers, TCAs) - Sertraline mildly inhibits CYP2D6",
      "Alcohol - Additive CNS effects; may worsen depression",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Sertraline must be taken daily for 2 to 6 weeks before full therapeutic effects are felt; it is not effective for acute symptom relief.",
    "Do not combine with MAOIs; allow at least 14 days between stopping an MAOI and starting sertraline (and vice versa) to avoid serotonin syndrome.",
    "Do not stop abruptly; taper the dose gradually under medical supervision to reduce discontinuation symptoms such as dizziness, nausea, irritability, and 'brain zaps'.",
    "Be alert for signs of serotonin syndrome (agitation, sweating, tremor, hyperthermia, clonus) when combined with other serotonergic drugs.",
    "Watch for emerging or worsening suicidal ideation, particularly in children, adolescents, and young adults during the first weeks of therapy.",
    "Use caution in patients with hepatic impairment; dose reduction or less frequent dosing may be required.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C17H17Cl2N",
    molecularWeight: "342.7 g/mol",
    class: "SSRI",
  },
  history:
    "Sertraline was developed by Pfizer chemists in the 1970s and approved by the US FDA in 1991, originally marketed under the brand name Zoloft. It was derived from the tametraline series of norepinephrine-dopamine reuptake inhibitors, but structure-activity modifications shifted its profile toward potent and selective serotonin reuptake inhibition. Sertraline went on to become one of the most prescribed antidepressants in the world and is now available as a generic.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "low",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Sertraline",
};
