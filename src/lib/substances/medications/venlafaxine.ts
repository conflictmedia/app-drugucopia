import type { Substance } from "../types";

export const venlafaxine: Substance = {
  id: "venlafaxine",
  name: "Venlafaxine",
  commonNames: ["Venlafaxine", "Effexor", "Effexor XR"],
  categories: ["medications"],
  class: "SNRI",
  description:
    "Venlafaxine is a serotonin-norepinephrine reuptake inhibitor (SNRI) used primarily for major depressive disorder, generalized anxiety disorder, social anxiety disorder, and panic disorder. It inhibits reuptake of serotonin at all doses, with norepinephrine reuptake inhibition becoming clinically significant at doses above approximately 150 mg/day, and weak dopamine reuptake effects at higher doses. This dose-dependent pharmacology distinguishes it from SSRIs and contributes to its use in treatment-resistant depression at higher doses. Abrupt discontinuation is associated with a notoriously severe withdrawal syndrome due to its short half-life, requiring slow tapering. Therapeutic antidepressant effects typically require 2 to 6 weeks of continuous daily dosing to fully manifest.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Increased energy and motivation (at higher doses)",
      "Improved concentration",
      "Reduction of panic and social anxiety symptoms",
    ],
    neutral: [
      "Mild appetite suppression",
      "Dose-dependent norepinephrine effects",
      "Sleep architecture changes",
      "Mild pupillary dilation",
      "Delayed onset of therapeutic action",
    ],
    negative: [
      "Nausea and gastrointestinal upset",
      "Sexual dysfunction (decreased libido, anorgasmia)",
      "Insomnia or somnolence",
      "Diastolic hypertension (at higher doses)",
      "Severe discontinuation syndrome on abrupt withdrawal",
      "Sweating and vivid dreams",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "37.5mg",
        light: "37.5-75mg",
        common: "75-150mg",
        strong: "150-225mg",
        heavy: "225-375mg+",
      },
      duration: {
        onset: "1-2 hours",
        comeup: "2-4 hours",
        peak: "4-8 hours",
        offset: "8-15 hours",
        total: "12-24 hours (XR formulation permits once-daily dosing)",
        afterglow: "Therapeutic antidepressant effects develop over 2-6 weeks of continuous daily use",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe serotonin syndrome; at least 14-day washout required",
      "Other serotonergic antidepressants (SSRIs, SNRIs, TCAs) - Risk of serotonin syndrome",
      "Linezolid or methylene blue - Reversible MAOIs; risk of serotonin syndrome",
      "Meperidine (pethidine) and tramadol - Risk of serotonin syndrome",
    ],
    unsafe: [
      "Triptans (e.g., sumatriptan) - Rare risk of serotonin syndrome",
      "St. John's wort - Increased serotonergic activity",
      "NSAIDs and anticoagulants - Increased bleeding risk due to platelet serotonin depletion",
    ],
    uncertain: [
      "Alcohol - Manufacturer advises avoidance; CNS effects may be potentiated",
      "CYP2D6 inhibitors (e.g., paroxetine, fluoxetine, quinidine) - May increase venlafaxine levels",
      "Haloperidol - Increased plasma levels of haloperidol",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Venlafaxine must be taken consistently every day for 2 to 6 weeks before therapeutic antidepressant effects are felt; it is not effective for acute mood elevation.",
    "Abrupt discontinuation can cause a severe withdrawal syndrome characterized by 'brain zaps', dizziness, nausea, irritability, and flu-like symptoms. Always taper the dose gradually under medical supervision, ideally over several weeks.",
    "Blood pressure should be monitored at higher doses (above 150 mg/day), as norepinephrine reuptake inhibition can cause sustained diastolic hypertension requiring dose reduction or discontinuation.",
    "At least 14 days must elapse between discontinuation of an MAOI and initiation of venlafaxine (and vice versa) to avoid precipitating serotonin syndrome.",
    "Use with caution in patients with hepatic or renal impairment; dosage reduction is generally required. Avoid use with uncontrolled hypertension or severe cardiac disease.",
    "Venlafaxine may increase the risk of suicidal thinking and behavior in children, adolescents, and young adults; close monitoring is required during the first weeks of treatment.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C17H27NO2",
    molecularWeight: "277.4 g/mol",
    class: "SNRI",
  },
  history:
    "Venlafaxine was first synthesized by researchers at Wyeth (now part of Pfizer) and received FDA approval in 1993 as an immediate-release formulation for the treatment of major depressive disorder. The extended-release (XR) formulation followed, offering once-daily dosing and improved tolerability. It became one of the first widely prescribed SNRIs and was historically used off-label for neuropathic pain and hot flashes. Wyeth's patent expired in 2008, after which numerous generic versions became available worldwide.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Venlafaxine",
};
