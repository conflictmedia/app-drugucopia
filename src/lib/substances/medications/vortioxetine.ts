import type { Substance } from "../types";

export const vortioxetine: Substance = {
  id: "vortioxetine",
  name: "Vortioxetine",
  commonNames: ["Vortioxetine", "Brintellix", "Trintellix"],
  categories: ["medications"],
  class: "Multimodal serotonergic antidepressant",
  description:
    "Vortioxetine is a multimodal serotonergic antidepressant that combines inhibition of serotonin reuptake with direct activity at multiple serotonin receptors: it is an antagonist at 5-HT3, 5-HT7, and 5-HT1D receptors, a partial agonist at 5-HT1B, and a full agonist at 5-HT1A. This profile is intended to enhance serotonergic signaling across several pathways involved in mood and cognition. It is approved for major depressive disorder in adults at doses of 5-20 mg/day, and clinical trials suggest a comparatively favorable profile for cognitive dysfunction in depression and reduced sexual dysfunction relative to SSRIs. Common adverse effects include nausea, vomiting, and constipation; discontinuation symptoms can occur if stopped abruptly. It is metabolized primarily by CYP2D6, so dose adjustment is needed with strong CYP2D6 inhibitors.",
  effects: {
    positive: [
      "Mood improvement (with chronic use)",
      "Improvement in cognitive symptoms of depression",
      "Relatively lower rate of sexual dysfunction than SSRIs",
      "Anxiolysis",
      "Generally weight-neutral",
    ],
    neutral: [
      "Nausea (most common, usually transient)",
      "Mild constipation",
      "Vivid dreams",
      "Delayed onset of therapeutic effect over weeks",
    ],
    negative: [
      "Nausea and vomiting",
      "Sexual dysfunction (less than SSRIs but possible)",
      "Discontinuation syndrome on abrupt cessation",
      "Hyponatremia (SIADH, rare)",
      "Abnormal bleeding risk with concomitant antiplatelet/anticoagulant drugs",
      "Activation of mania in bipolar patients",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "5mg",
        light: "5-10mg/day",
        common: "10-20mg/day",
        strong: "20mg/day (maximum recommended dose)",
        heavy: "20mg+ (above recommended maximum; increased adverse effects)",
      },
      duration: {
        onset: "2-4 weeks for antidepressant effect",
        comeup: "Weeks of gradual improvement",
        peak: "Steady-state therapeutic benefit after 4-6 weeks",
        offset: "1-2 weeks if discontinued",
        total: "Chronic daily use",
        afterglow: "Unknown",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of serotonin syndrome; 14-21 day washout required",
      "Linezolid or intravenous methylene blue - Serotonergic interaction; discontinue vortioxetine during use",
      "Other serotonergic drugs (e.g., tramadol, meperidine, St. John's wort, triptans) - Additive serotonin syndrome risk",
    ],
    unsafe: [
      "Strong CYP2D6 inhibitors (e.g., bupropion, paroxetine, fluoxetine, quinidine) - Raise vortioxetine levels; reduce vortioxetine dose by half",
      "Antiplatelet or anticoagulant drugs (e.g., aspirin, NSAIDs, warfarin) - Increased bleeding risk from impaired platelet serotonin uptake",
      "Alcohol - Additive CNS effects; not formally studied",
    ],
    uncertain: [
      "CYP2D6 poor metabolizers - Higher exposure; consider dose reduction",
      "Drugs that lower seizure threshold - Theoretical additive risk",
      "CYP inducers (e.g., carbamazepine, rifampin, phenytoin) - May lower vortioxetine levels",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Vortioxetine takes 2-4 weeks to produce clinically meaningful antidepressant effects; continue daily dosing as prescribed and do not stop abruptly for lack of immediate benefit.",
    "Allow at least 14 days between discontinuing an MAOI and starting vortioxetine, and at least 21 days between stopping vortioxetine and starting an MAOI.",
    "Report any signs of serotonin syndrome (agitation, tremor, hyperreflexia, fever, sweating, confusion) immediately, particularly when combined with other serotonergic drugs.",
    "When co-prescribed with strong CYP2D6 inhibitors such as bupropion or paroxetine, reduce the vortioxetine dose by approximately half.",
    "Use cautiously in patients with bleeding risk factors or those taking antiplatelet/anticoagulant medications, as with other serotonergic antidepressants.",
    "Taper gradually when discontinuing to minimize discontinuation symptoms (mood swings, irritability, dizziness, sensory disturbances).",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C18H22N2S",
    molecularWeight: "298.45 g/mol (freebase); 379.36 g/mol as hydrobromide salt",
    class: "Multimodal serotonergic antidepressant",
  },
  history:
    "Vortioxetine was developed through a collaboration between H. Lundbeck A/S and Takeda Pharmaceutical Company and was approved by the U.S. FDA in September 2013 (and by the European Medicines Agency in late 2013) for the treatment of major depressive disorder in adults. It was originally marketed in the United States under the brand name Brintellix, which was changed to Trintellix in 2016 to reduce confusion with the antiplatelet drug Brilinta (ticagrelor). Its receptor pharmacology was designed to preserve antidepressant efficacy while reducing SSRI-type adverse effects such as sexual dysfunction and cognitive blunting.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "low",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Vortioxetine",
};
