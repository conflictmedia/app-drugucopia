import type { Substance } from "../types";

export const lithium: Substance = {
  id: "lithium",
  name: "Lithium",
  commonNames: ["Lithium", "Lithium carbonate", "Eskalith", "Lithobid"],
  categories: ["medications"],
  class: "Mood stabilizer (monovalent cation)",
  description:
    "Lithium is a monovalent cation mood stabilizer that remains a gold-standard treatment for bipolar disorder and is unique among psychotropics for its robust antisuicidal and antiautochthonous-depression prophylactic effects. Its precise mechanism remains incompletely elucidated but involves inhibition of inositol monophosphatase and glycogen synthase kinase-3 beta (GSK-3beta), modulation of neurotransmitter signaling, and neurotrophic effects. Lithium is dosed as lithium carbonate (300 mg lithium carbonate contains approximately 8.12 mEq of elemental lithium) and is indicated for acute mania and for maintenance treatment of bipolar I disorder, with adjunctive roles in unipolar depression and cluster B personality disorders. It has a notoriously narrow therapeutic window: serum levels between 0.6 and 1.2 mEq/L are generally effective, toxicity emerges above approximately 1.5 mEq/L, and fatal toxicity is possible above 2.5 mEq/L. Renal clearance is highly sensitive to sodium and water balance, so coadministration of NSAIDs, ACE inhibitors, angiotensin receptor blockers, and thiazide diuretics, or any state of dehydration, can precipitate toxicity. Long-term use requires monitoring of renal function, thyroid function, and parathyroid status.",
  effects: {
    positive: [
      "Reduced manic symptoms",
      "Reduced recurrence of depressive episodes in bipolar disorder",
      "Mood stabilization",
      "Reduced suicide risk and impulsivity",
      "Prophylaxis against future bipolar episodes",
    ],
    neutral: [
      "Mild fine hand tremor",
      "Increased urination",
      "Increased thirst",
    ],
    negative: [
      "Fine hand tremor",
      "Polyuria and polydipsia (nephrogenic diabetes insipidus)",
      "GI upset (nausea, diarrhea)",
      "Hypothyroidism and goiter",
      "Cognitive dulling and subjective 'flattening'",
      "Leukocytosis and weight gain",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "300mg",
        light: "300-600mg",
        common: "600-1200mg",
        strong: "1200-1800mg",
        heavy: "1800mg+",
      },
      duration: {
        onset: "1-3 hours (absorption)",
        comeup: "1-2 weeks",
        peak: "2-4 weeks for full therapeutic effect",
        offset: "12-24 hours per dose",
        total: "24 hours (half-life approximately 18-24 hours)",
        afterglow: "Days to weeks with chronic therapy",
      },
    },
  },
  interactions: {
    dangerous: [
      "NSAIDs (ibuprofen, naproxen, indomethacin, diclofenac) - reduce lithium renal clearance and can precipitate toxicity",
      "ACE inhibitors and angiotensin II receptor blockers - reduce lithium excretion and raise serum levels",
      "Thiazide diuretics - substantially reduce lithium clearance and can precipitate toxicity",
      "Dehydration, sodium restriction, or prolonged sweating - raise lithium levels and toxicity risk",
      "SSRIs and SNRIs - increased risk of serotonin syndrome",
    ],
    unsafe: [
      "Caffeine (chronic high intake or abrupt withdrawal) - alters lithium renal excretion; abrupt caffeine cessation raises lithium levels",
      "Calcium channel blockers (verapamil, diltiazem) - reports of severe neurotoxicity",
      "Carbamazepine - increased neurotoxicity risk even at therapeutic levels",
      "Iodine-containing compounds (amiodarone, contrast media) - additive hypothyroid effect",
    ],
    uncertain: [
      "Topiramate - isolated reports of increased neurotoxicity",
      "Methyldopa - isolated reports of neurotoxicity",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Maintain serum lithium levels within the narrow therapeutic window: typically 0.6-1.2 mEq/L for maintenance (0.8-1.0 mEq/L often optimal for prophylaxis) and 1.0-1.2 mEq/L for acute mania. Check levels 12 hours after the last dose (trough), at least every 3-6 months once stable and more frequently during dose adjustment or intercurrent illness.",
    "Recognize early toxicity (coarse tremor, GI upset, ataxia, slurred speech, confusion) and severe toxicity (seizures, arrhythmia, coma). Toxicity risk rises sharply above 1.5 mEq/L; patients and caregivers should know these signs and seek immediate care if they appear.",
    "Maintain adequate hydration and sodium intake. Avoid NSAIDs (including OTC ibuprofen and naproxen) and inform all prescribers of lithium use, since ACE inhibitors, ARBs, thiazides, and metronidazole can raise lithium levels.",
    "Monitor renal function (creatinine and eGFR) and thyroid function (TSH, free T4) at baseline, every 3-6 months during the first year, then at least annually. Measure calcium and parathyroid hormone periodically because chronic lithium can cause hyperparathyroidism.",
    "Lithium is teratogenic (associated with Ebstein's anomaly and other cardiac defects) and should be avoided in pregnancy when possible; discuss contraception and preconception planning with patients of reproductive potential.",
    "Do not abruptly discontinue lithium. Rapid cessation carries a high risk of manic relapse and suicide; taper gradually over weeks to months under medical supervision, particularly after long-term use.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "Li2CO3",
    molecularWeight: "73.89 g/mol",
    class: "Inorganic monovalent cation salt",
  },
  history:
    "Lithium salts were used medically for various indications throughout the 19th century, including gout and as a general tonic and table-salt substitute. In 1949, Australian psychiatrist John Cade serendipitously demonstrated the anti-manic effect of lithium citrate while investigating urea metabolism in psychiatric patients. Following international adoption in the 1950s and 1960s, lithium carbonate was approved by the FDA in 1970 for the treatment of bipolar mania, and it remains one of the oldest and most evidence-based psychotropic medications in use.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "high",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Lithium_(medication)",
};
