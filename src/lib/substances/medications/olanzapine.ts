import type { Substance } from "../types";

export const olanzapine: Substance = {
  id: "olanzapine",
  name: "Olanzapine",
  commonNames: ["Olanzapine", "Zyprexa", "Zyprexa Zydis"],
  categories: ["medications"],
  class: "Atypical antipsychotic",
  description:
    "Olanzapine is a thienobenzodiazepine atypical antipsychotic that antagonizes dopamine D2 and serotonin 5-HT2A receptors, with notably strong affinity for histamine H1, muscarinic, 5-HT2C, and alpha-1 adrenergic receptors, producing marked sedation, appetite stimulation, and metabolic disturbance. It is indicated for schizophrenia and for acute and maintenance treatment of bipolar I disorder (manic and mixed episodes), and is available in a long-acting injectable formulation. Olanzapine is among the most metabolically burdensome atypical antipsychotics, with clinically significant weight gain, dyslipidemia, hyperglycemia, and an elevated risk of new-onset type 2 diabetes; clinicians should reserve low-dose combinations for treatment-refractory cases when other options have failed. Compared with first-generation antipsychotics, it carries a lower risk of extrapyramidal symptoms and hyperprolactinemia, though akathisia and tardive dyskinesia remain possible with chronic use.",
  effects: {
    positive: [
      "Reduced positive symptoms of psychosis",
      "Reduced negative symptoms of schizophrenia",
      "Mood stabilization",
      "Suppression of manic symptoms",
      "Sleep improvement",
      "Anxiety suppression",
    ],
    neutral: [
      "Sedation and somnolence",
      "Increased appetite",
      "Dry mouth",
    ],
    negative: [
      "Significant weight gain",
      "Metabolic syndrome, hyperglycemia, and dyslipidemia",
      "Sedation and somnolence",
      "Orthostatic hypotension",
      "Anticholinergic effects (dry mouth, constipation, blurred vision)",
      "Tardive dyskinesia (with chronic use)",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "2.5mg",
        light: "5-10mg",
        common: "10-20mg",
        strong: "20-30mg",
        heavy: "30mg+",
      },
      duration: {
        onset: "1-2 hours",
        comeup: "2-6 hours",
        peak: "4-12 hours",
        offset: "12-24 hours",
        total: "24-36 hours",
        afterglow: "12-24 hours",
      },
    },
  },
  interactions: {
    dangerous: [
      "QT-prolonging drugs (amiodarone, methadone, certain antipsychotics, fluoroquinolones) - additive QT prolongation and torsades de pointes risk",
      "Alcohol - additive CNS depression, sedation, and orthostatic hypotension",
      "Levodopa and dopamine agonists - olanzapine antagonizes their therapeutic effects",
    ],
    unsafe: [
      "CNS depressants (benzodiazepines, opioids) - additive sedation and respiratory depression, particularly in elderly patients",
      "Antihypertensives - enhanced orthostatic hypotension",
      "Carbamazepine (CYP1A2/3A4 inducer) and tobacco smoking - reduce olanzapine plasma levels, possibly requiring dose adjustment",
      "Fluvoxamine (CYP1A2 inhibitor) - substantially increases olanzapine plasma levels",
    ],
    uncertain: [
      "Warfarin - isolated reports of altered INR",
      "Diazepam - modest additive sedation and orthostasis",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Olanzapine carries one of the highest metabolic burdens among atypical antipsychotics. Establish baseline weight, waist circumference, fasting glucose, and lipid panel; recheck at 4, 8, and 12 weeks, then quarterly. Significant weight gain or new hyperglycemia/dyslipidemia may warrant switching agents.",
    "Sedation and orthostatic hypotension are common, especially at initiation. Rise slowly from sitting or lying positions and avoid driving or operating machinery until the response is known.",
    "Elderly patients with dementia-related psychosis treated with olanzapine have an increased risk of cerebrovascular events and mortality; olanzapine is not approved for this population.",
    "Olanzapine can prolong the QT interval. Avoid coadministration with other QT-prolonging drugs and use cautiously in patients with cardiac disease, electrolyte abnormalities, or bradycardia.",
    "Tardive dyskinesia can develop with chronic antipsychotic exposure; periodically assess for involuntary facial or limb movements, and discontinue if clinically appropriate.",
    "Do not abruptly stop olanzapine. Sudden discontinuation may cause insomnia, nausea, sweating, tachycardia, and psychotic relapse; taper the dose gradually under medical supervision.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C17H20N4S",
    molecularWeight: "312.44 g/mol",
    class: "Thienobenzodiazepine atypical antipsychotic",
  },
  history:
    "Olanzapine was discovered by Eli Lilly and Company and approved by the FDA in 1996 for the treatment of schizophrenia, with subsequent approvals for bipolar mania (2000) and bipolar maintenance (2004). It rapidly became one of the most widely prescribed atypical antipsychotics before growing concern about its substantial metabolic side-effect profile prompted more cautious use and the development of combination products such as olanzapine/samidorphan to mitigate weight gain.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Olanzapine",
};
