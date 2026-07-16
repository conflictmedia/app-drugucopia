import type { Substance } from "../types";

export const valproate: Substance = {
  id: "valproate",
  name: "Valproate",
  commonNames: ["Valproate", "Valproic acid", "Divalproex", "Depakote", "Depakene"],
  categories: ["medications"],
  class: "Mood stabilizer / Anticonvulsant",
  description:
    "Valproate (administered as valproic acid, divalproex sodium, or sodium valproate) is a branched short-chain fatty acid that blocks voltage-gated sodium channels and enhances GABAergic neurotransmission, with additional effects on histone deacetylase inhibition. It is indicated for acute manic or mixed episodes of bipolar disorder, for focal and generalized epilepsy, for migraine prophylaxis, and (in some regions) for adjunctive schizophrenia treatment. Valproate is highly teratogenic: it is associated with neural tube defects and fetal valproate syndrome (craniofacial anomalies, limb defects, developmental delay, and reduced IQ) and is contraindicated in pregnancy and in women of childbearing potential unless a pregnancy prevention program is strictly followed. The drug carries meaningful risks of hepatotoxicity (sometimes fatal, especially in young children), pancreatitis, and hyperammonemia, and commonly produces tremor, weight gain, thrombocytopenia, and hair loss. The therapeutic plasma concentration range for psychiatric use is approximately 50-125 micrograms/mL, monitored as trough total valproate.",
  effects: {
    positive: [
      "Reduced manic symptoms (acute)",
      "Mood stabilization",
      "Anticonvulsant effect",
      "Migraine prophylaxis",
      "Reduced aggression and impulsivity",
    ],
    neutral: [
      "Mild tremor",
      "Mild GI upset",
      "Increased appetite",
    ],
    negative: [
      "Hepatotoxicity (rare but potentially fatal)",
      "Pancreatitis (rare but potentially fatal)",
      "Weight gain",
      "Tremor",
      "Reversible hair loss (thin curly regrowth)",
      "Thrombocytopenia and teratogenicity",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "250mg",
        light: "250-750mg",
        common: "750-1500mg",
        strong: "1500-2500mg",
        heavy: "2500mg+",
      },
      duration: {
        onset: "1-4 hours (absorption)",
        comeup: "Days to weeks",
        peak: "1-2 weeks for full therapeutic effect",
        offset: "8-16 hours",
        total: "8-16 hours (half-life approximately 9-16 hours, dose-dependent)",
        afterglow: "Days at steady state",
      },
    },
  },
  interactions: {
    dangerous: [
      "Other hepatotoxic drugs (alcohol, isoniazid, methotrexate) - additive hepatic toxicity",
      "Warfarin and other highly protein-bound anticoagulants - valproate displaces warfarin from albumin, raising INR and bleeding risk",
      "Aspirin (high dose) - displaces valproate from albumin and inhibits its metabolism, raising free valproate levels",
      "Lamotrigine - valproate approximately doubles lamotrigine levels, markedly increasing Stevens-Johnson syndrome risk; halve lamotrigine dose and titrate more slowly",
      "Pregnancy - high teratogenic risk (neural tube defects, fetal valproate syndrome); contraindicated",
    ],
    unsafe: [
      "Carbamazepine - complex bidirectional interaction; carbamazepine induces valproate metabolism while valproate inhibits carbamazepine epoxide clearance",
      "Phenytoin - reciprocal displacement from protein binding and complex metabolism",
      "Carbapenem antibiotics (meropenem, imipenem, ertapenem) - dramatically reduce valproate plasma levels, sometimes causing seizures within hours",
      "Topiramate - additive risk of hyperammonemia and encephalopathy",
    ],
    uncertain: [
      "Rufinamide - valproate increases rufinamide levels",
      "Zidovudine - valproate may increase zidovudine levels",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Obtain baseline liver function tests (AST, ALT, bilirubin) and a CBC with platelets before starting valproate, then monitor periodically (typically every 1-2 months for the first 6 months, then every 6-12 months). Educate patients about signs of hepatotoxicity (malaise, anorexia, nausea, jaundice, dark urine) and instruct them to seek care immediately.",
    "Pancreatitis can occur at any time and may be fatal. Counsel patients to report abdominal pain, nausea, vomiting, and anorexia immediately; if pancreatitis is suspected, discontinue valproate and do not rechallenge.",
    "Valproate is highly teratogenic and is contraindicated in pregnancy and in women of childbearing potential unless a pregnancy prevention program is followed. Use highly effective contraception and document negative pregnancy test before initiation. Switch to a safer mood stabilizer (e.g., lithium, an antipsychotic) before conception when possible.",
    "Hyperammonemia can occur even with normal liver function and may cause lethargy, vomiting, and altered mental status; measure ammonia if symptomatic, and consider carnitine supplementation in symptomatic or chronically treated patients.",
    "Monitor platelet count and coagulation parameters before surgery and during chronic therapy; valproate can cause thrombocytopenia and impair platelet function. Adjust dose if platelets fall below 100,000/microL.",
    "Do not abruptly discontinue valproate in patients with epilepsy, as withdrawal can precipitate seizures. Taper gradually under medical supervision; in patients with bipolar disorder, abrupt cessation may trigger relapse.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C8H16O2",
    molecularWeight: "144.21 g/mol",
    class: "Branched short-chain fatty acid anticonvulsant",
  },
  history:
    "Valproic acid was first synthesized in 1882 by Beverly Burton as a solvent analog of valerian extract and was used for nearly 80 years as a chemical solvent. In 1963, French researcher Pierre Meunier serendipitously discovered its anticonvulsant properties while using it as a solvent for other investigational compounds. Valproic acid was approved by the FDA in 1978 (as Depakene), with the enteric-coated divalproex sodium formulation (Depakote) approved in 1983 to improve gastrointestinal tolerability.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "high",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Valproate",
};
