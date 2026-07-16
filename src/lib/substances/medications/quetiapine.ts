import type { Substance } from "../types";

export const quetiapine: Substance = {
  id: "quetiapine",
  name: "Quetiapine",
  commonNames: ["Quetiapine", "Seroquel", "Seroquel XR"],
  categories: ["medications"],
  class: "Atypical antipsychotic",
  description:
    "Quetiapine is a dibenzothiazepine atypical antipsychotic that acts as an antagonist at dopamine D2 and serotonin 5-HT2A receptors, with additional high-affinity binding to histamine H1, alpha-1 adrenergic, and 5-HT2C receptors that drives its characteristic sedation, orthostatic hypotension, and metabolic effects. It is indicated for schizophrenia, bipolar I disorder (manic, mixed, and depressive episodes), bipolar depression, and as an adjunct for major depressive disorder. Quetiapine has a relatively low risk of extrapyramidal symptoms and hyperprolactinemia compared with first-generation antipsychotics, but carries a meaningful risk of weight gain, dyslipidemia, hyperglycemia, and metabolic syndrome, particularly with chronic use. Sedation is prominent, especially during initiation and dose titration. The active metabolite norquetiapine contributes to antidepressant and sedative effects and inhibits norepinephrine reuptake.",
  effects: {
    positive: [
      "Reduced positive symptoms of psychosis",
      "Reduced negative symptoms of schizophrenia",
      "Mood stabilization",
      "Reduced manic symptoms",
      "Sleep improvement",
      "Anxiety suppression",
    ],
    neutral: [
      "Sedation and somnolence",
      "Mild weight gain",
      "Dry mouth",
      "Mild orthostatic hypotension",
    ],
    negative: [
      "Significant weight gain",
      "Metabolic syndrome (dyslipidemia, hyperglycemia)",
      "Sedation and next-day grogginess",
      "Orthostatic hypotension",
      "Dry mouth and constipation",
      "Tardive dyskinesia (with chronic use)",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "25mg",
        light: "50-150mg",
        common: "150-400mg",
        strong: "400-600mg",
        heavy: "600-800mg+",
      },
      duration: {
        onset: "1-2 hours",
        comeup: "2-4 hours",
        peak: "2-6 hours",
        offset: "8-12 hours",
        total: "8-12 hours (immediate release)",
        afterglow: "12-24 hours",
      },
    },
  },
  interactions: {
    dangerous: [
      "CYP3A4 inhibitors (ketoconazole, clarithromycin, ritonavir) - drastically increase quetiapine plasma levels, requiring major dose reduction",
      "QT-prolonging drugs (amiodarone, methadone, certain antipsychotics, fluoroquinolones) - additive QT prolongation and torsades de pointes risk",
      "Alcohol - additive CNS depression, sedation, and orthostatic hypotension",
    ],
    unsafe: [
      "CNS depressants (benzodiazepines, opioids, barbiturates) - additive sedation and respiratory depression",
      "Antihypertensives - enhanced orthostatic hypotension",
      "CYP3A4 inducers (phenytoin, carbamazepine, rifampin) - substantially reduce quetiapine plasma levels and effectiveness",
      "Levodopa and dopamine agonists - quetiapine antagonizes their therapeutic effects",
    ],
    uncertain: [
      "Warfarin - isolated reports of altered INR",
      "Thyroid medications - quetiapine may modestly lower total T4 and free T4",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Quetiapine causes dose-dependent sedation and orthostatic hypotension; rise slowly from sitting or lying positions, particularly during the first days of treatment or after dose increases.",
    "Monitor metabolic parameters at baseline and periodically thereafter: weight, waist circumference, fasting glucose, and lipid panel. Significant weight gain and new-onset hyperglycemia or dyslipidemia may require dose adjustment or switching agents.",
    "Quetiapine can prolong the QT interval. Avoid coadministration with other QT-prolonging drugs and use cautiously in patients with cardiac disease, electrolyte abnormalities, or a family history of sudden cardiac death.",
    "Cataracts and lens changes were observed in preclinical dog studies; routine eye examinations are prudent during long-term therapy, though clinical significance in humans remains debated.",
    "Tardive dyskinesia can occur with chronic antipsychotic exposure. Periodically assess for involuntary, repetitive facial or limb movements, especially in elderly patients and women.",
    "Do not abruptly discontinue quetiapine. Sudden cessation can precipitate insomnia, nausea, headache, diarrhea, vomiting, dizziness, and irritability; taper the dose gradually under medical supervision.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C21H25N3OS",
    molecularWeight: "383.51 g/mol",
    class: "Dibenzothiazepine atypical antipsychotic",
  },
  history:
    "Quetiapine was first synthesized in 1985 by researchers at AstraZeneca (then ICI Pharmaceuticals). It was developed as a multireceptor-targeting antipsychotic intended to retain efficacy while minimizing extrapyramidal symptoms. The FDA approved quetiapine in 1997 for schizophrenia, and subsequent approvals expanded its use to bipolar mania, bipolar depression, and as an adjunct for major depressive disorder.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Quetiapine",
};
