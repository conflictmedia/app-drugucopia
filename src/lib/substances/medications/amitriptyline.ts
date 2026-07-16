import type { Substance } from "../types";

export const amitriptyline: Substance = {
  id: "amitriptyline",
  name: "Amitriptyline",
  commonNames: ["Amitriptyline", "Elavil", "Endep", "Vanatrip", "Tryptizol"],
  categories: ["medications"],
  class: "TCA (Tricyclic antidepressant)",
  description:
    "Amitriptyline is a tricyclic antidepressant (TCA) that inhibits reuptake of serotonin and, to a lesser extent, norepinephrine, while also producing potent antagonism at muscarinic, alpha-1 adrenergic, and H1 histamine receptors. It is approved for major depressive disorder at doses of 75-200 mg/day but is now more widely used off-label at lower doses (10-75 mg) for neuropathic pain, fibromyalgia, migraine prophylaxis, and chronic insomnia. Its broad receptor activity produces characteristic anticholinergic, antihistaminergic, and antiadrenergic side effects, including dry mouth, constipation, sedation, and orthostatic hypotension. A critical safety feature of amitriptyline is its high toxicity in overdose: ingestion of as little as 1 gram (5-10 times a therapeutic dose) can be lethal due to sodium-channel blockade causing QRS widening, arrhythmias, hypotension, and anticholinergic delirium, with CNS depression and seizures also common.",
  effects: {
    positive: [
      "Relief of depression (with chronic use)",
      "Reduction in chronic neuropathic pain",
      "Migraine prophylaxis",
      "Improved sleep architecture and insomnia relief",
      "Anxiolysis",
    ],
    neutral: [
      "Marked sedation (often used at night)",
      "Dry mouth and constipation from anticholinergic effects",
      "Increased appetite and weight gain",
      "Orthostatic hypotension",
    ],
    negative: [
      "Highly lethal in overdose (cardiac arrhythmia, seizures, coma)",
      "QTc and QRS prolongation",
      "Urinary retention and blurred vision",
      "Cognitive impairment in older adults",
      "Sexual dysfunction",
      "Withdrawal symptoms on abrupt discontinuation",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "10mg (pain / migraine prophylaxis)",
        light: "25-50mg (pain, insomnia, low-end depression)",
        common: "75-150mg/day (depression)",
        strong: "150-200mg/day (upper depression range)",
        heavy: "200mg+ (narrow therapeutic index; high overdose toxicity)",
      },
      duration: {
        onset: "2-6 weeks for antidepressant effect; days for analgesic / sedative effects",
        comeup: "Weeks of gradual mood and pain improvement",
        peak: "Steady-state therapeutic benefit after 4-6 weeks",
        offset: "1-3 weeks if discontinued",
        total: "Chronic daily use",
        afterglow: "Unknown",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine) - Risk of hypertensive crisis and serotonin syndrome; 14-day washout required",
      "Other QT-prolonging drugs (e.g., amiodarone, sotalol, certain antipsychotics, methadone) - Additive QT prolongation and torsades risk",
      "Clonidine - Risk of hypertensive crisis and loss of antihypertensive effect",
      "SSRIs that inhibit CYP2D6 (e.g., paroxetine, fluoxetine) - Raise TCA plasma levels and toxicity risk",
    ],
    unsafe: [
      "Alcohol - Additive CNS depression and increased seizure/arrhythmia risk",
      "Other anticholinergic drugs - Additive anticholinergic burden, delirium risk",
      "Tramadol and other seizure-threshold-lowering drugs - Additive seizure risk",
      "CYP2D6 inhibitors (e.g., bupropion, quinidine) - Raise TCA levels",
    ],
    uncertain: [
      "Thyroid hormone replacement - TCAs may precipitate arrhythmia in hyperthyroid patients",
      "Warfarin - Altered anticoagulant effect",
      "Cimetidine - May raise TCA levels via CYP inhibition",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Amitriptyline has a narrow therapeutic index and is highly toxic in overdose. Ingestion of 10-20 mg/kg can be fatal due to cardiac sodium-channel blockade (QRS widening, ventricular arrhythmias), hypotension, CNS depression, and seizures. Patients with suicidal ideation should generally be prescribed smaller quantities.",
    "Obtain a baseline ECG in older adults and in patients with cardiac disease, and use with caution in anyone with pre-existing conduction abnormalities, recent myocardial infarction, or electrolyte disturbance.",
    "Avoid coadministration with other QT-prolonging drugs and with MAOIs; allow at least 14 days between MAOI discontinuation and starting a TCA.",
    "Amitriptyline has strong anticholinergic effects and is included on the Beers list of potentially inappropriate medications for older adults because of increased risk of confusion, dry mouth, constipation, urinary retention, and falls.",
    "Taper gradually when discontinuing after chronic use to avoid withdrawal symptoms such as nausea, headache, malaise, and cholinergic rebound.",
    "Store securely, keep away from children, and never combine multiple TCA-containing products.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C20H23N",
    molecularWeight: "277.4 g/mol (freebase); 313.86 g/mol as hydrochloride salt",
    class: "Tricyclic antidepressant (tertiary amine)",
  },
  history:
    "Amitriptyline was first synthesized in 1960 by the Merck chemist Frank Berger's group from the tetracyclic antipsychotic prototype structure and was approved by the U.S. FDA in 1961 for the treatment of major depression. It became one of the most widely prescribed antidepressants worldwide through the 1970s and 1980s before being largely supplanted by SSRIs, which have a far safer overdose profile. Its use has since shifted predominantly to off-label indications such as neuropathic pain, fibromyalgia, migraine prophylaxis, and insomnia at lower doses.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "high",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Amitriptyline",
};
