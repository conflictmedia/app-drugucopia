import type { Substance } from "../types";

export const duloxetine: Substance = {
  id: "duloxetine",
  name: "Duloxetine",
  commonNames: ["Duloxetine", "Cymbalta", "Irenka", "Drizalma"],
  categories: ["medications"],
  class: "SNRI",
  description:
    "Duloxetine is a serotonin-norepinephrine reuptake inhibitor (SNRI) approved for major depressive disorder, generalized anxiety disorder, diabetic peripheral neuropathic pain, fibromyalgia, and chronic musculoskeletal pain. Unlike venlafaxine, duloxetine inhibits both serotonin and norepinephrine reuptake at all clinically used doses, making it a balanced SNRI throughout its dosing range. It is also a moderately potent CYP2D6 inhibitor, which can raise plasma levels of co-administered CYP2D6 substrates such as metoprolol and desipramine. Therapeutic antidepressant effects typically require 2 to 6 weeks of continuous daily dosing to fully manifest.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Reduction of neuropathic and musculoskeletal pain",
      "Improved energy and motivation",
      "Improved sleep quality (in some patients)",
    ],
    neutral: [
      "Balanced SNRI at all therapeutic doses",
      "Once-daily enteric-coated dosing",
      "Mild appetite suppression",
      "Delayed onset of therapeutic action",
    ],
    negative: [
      "Nausea and dry mouth",
      "Sexual dysfunction (decreased libido, anorgasmia)",
      "Insomnia or somnolence",
      "Fatigue and asthenia",
      "Discontinuation syndrome on abrupt withdrawal",
      "Hepatotoxicity (rare; avoid in hepatic impairment)",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "20mg",
        light: "20-30mg",
        common: "30-60mg",
        strong: "60-90mg",
        heavy: "90-120mg+",
      },
      duration: {
        onset: "2-4 hours",
        comeup: "4-8 hours",
        peak: "6-12 hours",
        offset: "12-24 hours",
        total: "Approximately 24 hours (half-life ~12 hours permits once-daily dosing)",
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
      "Thioridazine - Duloxetine-mediated CYP2D6 inhibition raises thioridazine levels, risking QT prolongation",
    ],
    unsafe: [
      "CYP2D6 substrates (e.g., metoprolol, desipramine, nortriptyline) - Duloxetine raises their plasma levels",
      "Triptans (e.g., sumatriptan) - Rare risk of serotonin syndrome",
      "NSAIDs and anticoagulants - Increased bleeding risk due to platelet serotonin depletion",
      "Alcohol - Avoid in patients with substantial alcohol use; risk of severe liver injury",
    ],
    uncertain: [
      "CYP1A2 inhibitors (e.g., fluvoxamine, ciprofloxacin) - Increase duloxetine plasma levels",
      "St. John's wort - Increased serotonergic activity",
      "Warfarin - Altered INR reported; monitor coagulation parameters",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Duloxetine must be taken consistently every day for 2 to 6 weeks before therapeutic antidepressant effects are felt; it is not effective for acute mood elevation.",
    "Abrupt discontinuation can cause withdrawal symptoms including dizziness, nausea, irritability, and 'brain zaps'. Always taper the dose gradually under medical supervision.",
    "Duloxetine should be avoided in patients with hepatic impairment or substantial alcohol use due to the risk of hepatotoxicity. Baseline and periodic liver function monitoring is advisable.",
    "Blood pressure should be monitored, particularly in patients with pre-existing hypertension or cardiac disease, as norepinephrine reuptake inhibition can elevate blood pressure.",
    "At least 14 days must elapse between discontinuation of an MAOI and initiation of duloxetine (and vice versa) to avoid precipitating serotonin syndrome.",
    "Duloxetine may increase the risk of suicidal thinking and behavior in children, adolescents, and young adults; close monitoring is required during the first weeks of treatment.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C18H19NOS",
    molecularWeight: "297.4 g/mol",
    class: "SNRI",
  },
  history:
    "Duloxetine was discovered in 1993 by Eli Lilly and Company (designated LY248686) and received FDA approval in August 2004 under the brand name Cymbalta for the treatment of major depressive disorder. Subsequent FDA approvals expanded its indications to include diabetic peripheral neuropathic pain (2004), generalized anxiety disorder (2007), fibromyalgia (2008), and chronic musculoskeletal pain (2010). It became one of the most widely prescribed SNRIs in the world following its launch.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Duloxetine",
};
