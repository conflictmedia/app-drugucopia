import type { Substance } from "../types";

export const lamotrigine: Substance = {
  id: "lamotrigine",
  name: "Lamotrigine",
  commonNames: ["Lamotrigine", "Lamictal", "Lamictal XR"],
  categories: ["medications"],
  class: "Anticonvulsant / Mood stabilizer",
  description:
    "Lamotrigine is a phenyltriazine anticonvulsant that inhibits voltage-gated sodium channels, thereby reducing presynaptic glutamate release, and may also modulate voltage-gated calcium channels. It is indicated for focal and generalized epilepsy and for the maintenance treatment of bipolar I disorder, where it is particularly effective at preventing depressive episodes but is not effective for acute mania or for bipolar II rapid cycling as monotherapy. Lamotrigine is generally well tolerated and lacks the weight gain, sedation, and cognitive effects common to many other mood stabilizers and anticonvulsants. Its defining safety concern is rash: Stevens-Johnson syndrome and toxic epidermal necrolysis are rare but life-threatening, and risk is strongly related to rapid titration, high starting dose, and coadministration with valproate (which doubles lamotrigine plasma levels and necessitates halving the lamotrigine dose and titrating even more slowly). Estrogen-containing oral contraceptives substantially reduce lamotrigine levels and may require dose adjustment.",
  effects: {
    positive: [
      "Prevention of depressive episodes in bipolar disorder",
      "Anticonvulsant effect",
      "Mood stabilization",
      "Generally well tolerated cognitively",
      "Reduced rapid cycling in some patients",
    ],
    neutral: [
      "Mild headache",
      "Mild dizziness",
      "Mild nausea",
    ],
    negative: [
      "Stevens-Johnson syndrome and toxic epidermal necrolysis (rare but life-threatening)",
      "Dizziness",
      "Headache",
      "Diplopia and blurred vision",
      "Ataxia",
      "Nausea and somnolence",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "25mg",
        light: "25-100mg",
        common: "100-200mg",
        strong: "200-400mg",
        heavy: "400mg+",
      },
      duration: {
        onset: "2-5 hours (absorption)",
        comeup: "Days to weeks",
        peak: "1-2 weeks for therapeutic effect",
        offset: "1-2 days",
        total: "25 hours (half-life approximately 25-33 hours; 50-70 hours with valproate)",
        afterglow: "Days to weeks at steady state",
      },
    },
  },
  interactions: {
    dangerous: [
      "Valproate - approximately doubles lamotrigine plasma levels by inhibiting glucuronidation; lamotrigine dose must be halved and titrated even more slowly to reduce Stevens-Johnson syndrome risk",
      "Rapid dose escalation, high starting dose, or coadministration with valproate - markedly increased Stevens-Johnson syndrome and toxic epidermal necrolysis risk",
    ],
    unsafe: [
      "Carbamazepine, phenytoin, primidone, and phenobarbital - induce lamotrigine glucuronidation, reducing lamotrigine levels; higher lamotrigine doses typically required",
      "Estrogen-containing oral contraceptives - significantly reduce lamotrigine plasma levels; adjust dose upward when starting and downward when stopping",
      "Rifampin - induces lamotrigine metabolism, reducing levels",
    ],
    uncertain: [
      "Risperidone - isolated reports of rash when combined",
      "Sertraline - may modestly increase lamotrigine levels",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Strictly follow the slow titration schedule. In adults not taking valproate or enzyme inducers, lamotrigine is typically started at 25 mg daily for 2 weeks, increased to 50 mg daily for 2 weeks, then to 100 mg daily for 1 week, and finally to 200 mg daily. With valproate coadministration, start at 25 mg every other day for 2 weeks and titrate more slowly with a target maintenance dose of approximately 100 mg daily.",
    "Counsel patients to stop lamotrigine and seek immediate medical attention for any rash, fever, lymphadenopathy, mucosal lesions (mouth, eyes, lips), or flu-like symptoms during the first 8 weeks of therapy. Most Stevens-Johnson syndrome cases occur within this window.",
    "Lamotrigine dose must be reduced by approximately 50% when starting valproate and increased when starting enzyme inducers or estrogen-containing contraceptives. Conversely, lamotrigine levels rise when oral contraceptives are discontinued; reduce the lamotrigine dose to avoid toxicity.",
    "Do not abruptly discontinue lamotrigine, particularly in patients with epilepsy, as sudden withdrawal can precipitate seizures and status epilepticus. Taper the dose over at least 2 weeks when possible.",
    "Lamotrigine may rarely cause aseptic meningitis; advise patients to seek care for headache, fever, nausea, vomiting, and neck stiffness without another clear cause.",
    "There is no established therapeutic plasma concentration range for psychiatric use; dosing is based on clinical response and tolerability, with most adults responding to 100-200 mg daily in bipolar maintenance.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C9H7Cl2N5",
    molecularWeight: "256.09 g/mol",
    class: "Phenyltriazine anticonvulsant",
  },
  history:
    "Lamotrigine was discovered by Wellcome Research Laboratories (now part of GlaxoSmithKline) and approved by the FDA in 1994 for the treatment of epilepsy, originally as adjunctive therapy for partial seizures. Based on its mood-stabilizing properties observed in clinical use, it was subsequently approved by the FDA in 2003 for the maintenance treatment of bipolar I disorder, with particular benefit in delaying depressive episodes.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Lamotrigine",
};
