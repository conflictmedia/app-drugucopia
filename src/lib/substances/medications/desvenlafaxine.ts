import type { Substance } from "../types";

export const desvenlafaxine: Substance = {
  id: "desvenlafaxine",
  name: "Desvenlafaxine",
  commonNames: ["Desvenlafaxine", "Pristiq", "Khedezla"],
  categories: ["medications"],
  class: "SNRI",
  description:
    "Desvenlafaxine is a serotonin-norepinephrine reuptake inhibitor (SNRI) and the major active metabolite (O-desmethylvenlafaxine) of venlafaxine. It is approved for the treatment of major depressive disorder and inhibits reuptake of both serotonin and norepinephrine at standard clinical doses. Because it is already the active metabolite, desvenlafaxine bypasses the CYP2D6 metabolism that venlafaxine requires, resulting in more predictable plasma levels across patients with varying CYP2D6 activity. The 50 mg and 100 mg once-daily extended-release tablets are the most common therapeutic doses. Therapeutic antidepressant effects typically require 2 to 6 weeks of continuous daily dosing to fully manifest.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Improved energy",
      "Improved concentration",
      "Less inter-patient pharmacokinetic variability than venlafaxine",
    ],
    neutral: [
      "Once-daily extended-release dosing",
      "Mild appetite suppression",
      "Dose-dependent norepinephrine effects",
      "Delayed onset of therapeutic action",
    ],
    negative: [
      "Nausea and gastrointestinal upset",
      "Sexual dysfunction (decreased libido, anorgasmia)",
      "Insomnia or somnolence",
      "Discontinuation syndrome on abrupt withdrawal",
      "Sweating and headache",
      "Hypertension at higher doses",
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
        heavy: "200-400mg+",
      },
      duration: {
        onset: "1-2 hours",
        comeup: "2-4 hours",
        peak: "4-8 hours",
        offset: "8-15 hours",
        total: "12-24 hours (extended-release formulation permits once-daily dosing)",
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
      "CYP3A4 inhibitors (e.g., ketoconazole) - May modestly increase desvenlafaxine levels",
      "Drugs that inhibit renal tubular secretion - Theoretical increase in desvenlafaxine exposure",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Desvenlafaxine must be taken consistently every day for 2 to 6 weeks before therapeutic antidepressant effects are felt.",
    "Abrupt discontinuation can cause withdrawal symptoms including dizziness, nausea, irritability, and 'brain zaps'. Always taper the dose gradually under medical supervision.",
    "Blood pressure should be monitored, as norepinephrine reuptake inhibition can cause sustained hypertension at higher doses; dose reduction or discontinuation may be required.",
    "At least 14 days must elapse between discontinuation of an MAOI and initiation of desvenlafaxine (and vice versa) to avoid precipitating serotonin syndrome.",
    "Dose adjustment is required in moderate-to-severe renal impairment. Avoid use with uncontrolled hypertension or severe cardiac disease.",
    "Desvenlafaxine may increase the risk of suicidal thinking and behavior in children, adolescents, and young adults; close monitoring is required during the first weeks of treatment.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C16H25NO2",
    molecularWeight: "263.4 g/mol",
    class: "SNRI",
  },
  history:
    "Desvenlafaxine, the synthetic active metabolite of venlafaxine, was developed by Wyeth (acquired by Pfizer in 2009) and approved by the FDA in 2008 as an extended-release formulation for major depressive disorder. It was marketed under the brand name Pristiq and offered the pharmacokinetic advantage of bypassing CYP2D6-mediated metabolism, yielding more predictable plasma concentrations than the parent drug. The product has also been marketed under the brand name Khedezla as a bioequivalent extended-release tablet.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Desvenlafaxine",
};
