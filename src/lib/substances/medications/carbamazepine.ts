import type { Substance } from "../types";

export const carbamazepine: Substance = {
  id: "carbamazepine",
  name: "Carbamazepine",
  commonNames: ["Carbamazepine", "Tegretol", "Carbatrol", "Equetro"],
  categories: ["medications"],
  class: "Anticonvulsant / Mood stabilizer",
  description:
    "Carbamazepine is a dibenzazepine (tricyclic) anticonvulsant and mood stabilizer that blocks voltage-gated sodium channels, stabilizing the inactive state of the channel and reducing repetitive neuronal firing. It is indicated for focal and generalized epilepsy, trigeminal neuralgia, and acute manic and mixed episodes of bipolar I disorder, and was the first widely used non-lithium mood stabilizer. Carbamazepine is a potent inducer of CYP3A4, CYP2C9, CYP1A2, and several UDP-glucuronosyltransferases, and notably autoinduces its own metabolism, requiring dose escalation over the first 4-8 weeks of therapy as clearance rises. The HLA-B*1502 allele, present predominantly in Han Chinese, Thai, and other Southeast Asian populations, confers a markedly elevated risk of Stevens-Johnson syndrome and toxic epidermal necrolysis; patients of Asian ancestry should be screened before initiation. The therapeutic plasma concentration range is approximately 4-12 micrograms/mL, and clinicians must monitor for hyponatremia, leukopenia, and hepatotoxicity.",
  effects: {
    positive: [
      "Reduced manic symptoms (acute)",
      "Anticonvulsant effect",
      "Trigeminal neuralgia relief",
      "Mood stabilization",
      "Reduced aggression and impulsivity",
    ],
    neutral: [
      "Mild drowsiness",
      "Mild ataxia",
      "Mild diplopia",
    ],
    negative: [
      "Stevens-Johnson syndrome and toxic epidermal necrolysis (especially HLA-B*1502 carriers)",
      "Dizziness and drowsiness",
      "Ataxia and diplopia",
      "Hyponatremia (SIADH-like)",
      "Leukopenia and (rarely) aplastic anemia",
      "Hepatotoxicity",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "100mg",
        light: "200-400mg",
        common: "400-1200mg",
        strong: "1200-1600mg",
        heavy: "1600mg+",
      },
      duration: {
        onset: "2-8 hours (absorption)",
        comeup: "Days to weeks",
        peak: "1-2 weeks for full therapeutic effect (after autoinduction)",
        offset: "12-17 hours",
        total: "12-17 hours (half-life after autoinduction; 25-65 hours initially)",
        afterglow: "Days at steady state",
      },
    },
  },
  interactions: {
    dangerous: [
      "HLA-B*1502 allele carriers (Han Chinese, Thai, and other Southeast Asian populations) - markedly elevated Stevens-Johnson syndrome and toxic epidermal necrolysis risk; screen patients of Asian ancestry before initiation",
      "Potent CYP3A4 induction by carbamazepine - reduces effectiveness of oral contraceptives, warfarin, many antipsychotics (olanzapine, risperidone, quetiapine, aripiprazole, clozapine), calcium channel blockers, cyclosporine, tacrolimus, and direct oral anticoagulants",
      "Grapefruit juice - inhibits CYP3A4-mediated carbamazepine metabolism, raising carbamazepine plasma levels and toxicity risk",
      "MAOIs - risk of hypertensive crisis; require at least 14-day washout before carbamazepine initiation",
    ],
    unsafe: [
      "Other hepatotoxic drugs (alcohol, valproate, isoniazid) - additive hepatic toxicity",
      "Other CYP3A4 substrates with narrow therapeutic indices (e.g., digoxin, theophylline) - carbamazepine reduces their plasma levels",
      "CYP3A4 inducers (phenytoin, rifampin, phenobarbital) - reduce carbamazepine plasma levels",
      "Lamotrigine - pharmacokinetic and pharmacodynamic interaction with increased rash and neurotoxicity risk",
    ],
    uncertain: [
      "Isoniazid - may increase carbamazepine levels and hepatotoxicity risk",
      "Propoxyphene and diltiazem - inhibit carbamazepine metabolism, raising levels",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Screen patients of Han Chinese, Thai, Malay, Filipino, Indonesian, and South Asian ancestry for the HLA-B*1502 allele before starting carbamazepine. Carriers should not receive carbamazepine unless the benefit clearly outweighs the Stevens-Johnson syndrome risk.",
    "Begin at a low dose (200 mg twice daily in adults) and titrate gradually over 2-4 weeks. Because carbamazepine autoinduces its own metabolism, peak serum concentration falls over the first 4-8 weeks; dose increases are typically required to maintain therapeutic levels.",
    "Monitor CBC (with attention to white blood cell and neutrophil counts), liver function tests, and serum sodium at baseline and periodically during therapy. Discontinue if aplastic anemia, agranulocytosis, or symptomatic hyponatremia develops.",
    "Carbamazepine can cause symptomatic hyponatremia via an SIADH-like effect, especially in elderly patients and during the first 3 months. Check sodium at baseline, after 2 weeks, 1 month, 3 months, then every 6-12 months.",
    "Carbamazepine is a strong CYP3A4 inducer and reduces the effectiveness of hormonal contraceptives. Patients should use a non-hormonal or higher-dose method and be alerted to the risk of unintended pregnancy.",
    "Carbamazepine is pregnancy category D and is associated with neural tube defects, craniofacial anomalies, and developmental delay. Use effective contraception, plan preconception switch to a safer agent when possible, and supplement with high-dose folic acid before and during pregnancy if use cannot be avoided.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C15H12N2O",
    molecularWeight: "236.27 g/mol",
    class: "Dibenzazepine (tricyclic) anticonvulsant",
  },
  history:
    "Carbamazepine was first synthesized in 1953 by chemist Walter Schindler at the Swiss company J.R. Geigy AG (now Novartis). It was initially investigated as an antidepressant but proved more effective as an anticonvulsant and was approved by the FDA in 1968 for epilepsy and in 1974 for trigeminal neuralgia. In the 1980s it became established as the first widely used non-lithium mood stabilizer for bipolar disorder, though lithium remained the comparative gold standard.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "high",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Carbamazepine",
};
