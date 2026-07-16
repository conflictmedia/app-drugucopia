import type { Substance } from "../types";

export const risperidone: Substance = {
  id: "risperidone",
  name: "Risperidone",
  commonNames: ["Risperidone", "Risperdal", "Risperdal Consta"],
  categories: ["medications"],
  class: "Atypical antipsychotic",
  description:
    "Risperidone is a benzisoxazole atypical antipsychotic that antagonizes dopamine D2 and serotonin 5-HT2A receptors, with significant affinity for alpha-1 and alpha-2 adrenergic and histamine H1 receptors. It is metabolized by CYP2D6 to 9-hydroxyrisperidone (paliperidone), which has similar pharmacologic activity, so the active antipsychotic fraction reflects both parent and metabolite. Risperidone is indicated for schizophrenia, bipolar I manic and mixed episodes, and irritability associated with autistic disorder in children and adolescents. Although classified as an atypical, the risk of extrapyramidal symptoms rises sharply at doses above approximately 4-6 mg/day in adults, blurring its distinction from first-generation agents at higher doses. Dose-dependent hyperprolactinemia is common and may cause gynecomastia, galactorrhea, menstrual irregularities, and sexual dysfunction.",
  effects: {
    positive: [
      "Reduced positive symptoms of psychosis",
      "Suppression of manic symptoms",
      "Mood stabilization",
      "Reduced irritability in autism spectrum disorder",
      "Reduced aggression and impulsivity",
    ],
    neutral: [
      "Mild sedation",
      "Mild weight gain",
      "Hyperprolactinemia (often asymptomatic)",
    ],
    negative: [
      "Extrapyramidal symptoms (especially at higher doses)",
      "Hyperprolactinemia (galactorrhea, gynecomastia, sexual dysfunction)",
      "Akathisia",
      "Weight gain",
      "Orthostatic hypotension",
      "Tardive dyskinesia (with chronic use)",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "0.5mg",
        light: "1-2mg",
        common: "2-4mg",
        strong: "4-6mg",
        heavy: "6-16mg",
      },
      duration: {
        onset: "1-2 hours",
        comeup: "2-6 hours",
        peak: "4-12 hours",
        offset: "12-24 hours",
        total: "20-30 hours (with active metabolite)",
        afterglow: "12-24 hours",
      },
    },
  },
  interactions: {
    dangerous: [
      "QT-prolonging drugs (amiodarone, methadone, certain antipsychotics) - additive QT prolongation and torsades de pointes risk",
      "Alcohol - additive CNS depression and orthostatic hypotension",
      "Carbamazepine - induces CYP3A4, reducing risperidone active fraction and effectiveness",
    ],
    unsafe: [
      "Fluoxetine and paroxetine (CYP2D6 inhibitors) - increase risperidone plasma levels and reduce 9-hydroxyrisperidone, raising total active antipsychotic exposure",
      "CNS depressants (benzodiazepines, opioids) - additive sedation and orthostasis",
      "Levodopa and dopamine agonists - risperidone antagonizes their therapeutic effects",
      "Antihypertensives - enhanced orthostatic hypotension",
    ],
    uncertain: [
      "Clozapine - isolated reports of increased risperidone levels",
      "Amiodarone - possible additive QT prolongation",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Risperidone's extrapyramidal symptom risk increases dose-dependently above roughly 4-6 mg/day in adults; use the lowest effective dose and reassess regularly for parkinsonism, akathisia, and dystonia.",
    "Hyperprolactinemia is common and may be asymptomatic, but ask patients about galactorrhea, gynecomastia, menstrual changes, and sexual dysfunction; consider dose reduction or switching agents if symptomatic.",
    "Monitor weight, fasting glucose, and lipids at baseline and periodically; risperidone is less metabolically burdensome than olanzapine or clozapine but still carries meaningful risk.",
    "Risperidone can cause orthostatic hypotension, particularly during titration. Rise slowly from sitting or lying positions and use cautiously in patients with cardiovascular disease.",
    "Tardive dyskinesia may emerge with chronic use; perform periodic abnormal involuntary movement screening, especially in elderly patients.",
    "Do not abruptly discontinue risperidone. Sudden cessation can cause insomnia, nausea, anxiety, and psychotic relapse; the long-acting injectable formulation requires continued oral coverage during initiation and should only be administered by trained clinicians.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C23H27FN4O2",
    molecularWeight: "410.49 g/mol",
    class: "Benzisoxazole atypical antipsychotic",
  },
  history:
    "Risperidone was developed by Janssen Pharmaceutica and approved by the FDA in 1993 for the treatment of schizophrenia, making it the first second-generation antipsychotic introduced after clozapine. Subsequent approvals expanded its use to bipolar I mania and to irritability associated with autistic disorder in children. Its active metabolite, paliperidone (9-hydroxyrisperidone), was later developed and approved as a separate antipsychotic agent.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Risperidone",
};
