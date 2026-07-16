import type { Substance } from "../types";

export const vilazodone: Substance = {
  id: "vilazodone",
  name: "Vilazodone",
  commonNames: ["Vilazodone", "Viibryd", "Viibryd Titration Pack"],
  categories: ["medications"],
  class: "SPARI (Serotonin partial agonist and reuptake inhibitor)",
  description:
    "Vilazodone is a serotonin partial agonist and reuptake inhibitor (SPARI) that combines serotonin reuptake inhibition with partial agonist activity at 5-HT1A receptors, a profile conceptually blending an SSRI with the action of buspirone. It is approved for major depressive disorder in adults at doses of 10-40 mg/day. A defining pharmacokinetic feature is that vilazodone must be taken with food; administration without food reduces absorption by approximately 50% and may lead to inadequate efficacy. Common adverse effects include diarrhea, nausea, vomiting, and insomnia; sexual dysfunction occurs less frequently than with SSRIs but is still reported. As with other serotonergic antidepressants, vilazodone carries risks of serotonin syndrome when combined with MAOIs or other serotonergic agents, of activation of mania in bipolar patients, and of abnormal bleeding when coadministered with antiplatelet or anticoagulant drugs.",
  effects: {
    positive: [
      "Mood improvement (with chronic use)",
      "Anxiolysis",
      "Reduced sexual dysfunction relative to SSRIs",
      "Generally weight-neutral",
      "Improvement in depressive cognitive symptoms",
    ],
    neutral: [
      "Must be taken with food for adequate absorption",
      "Delayed onset of therapeutic effect over weeks",
      "Vivid dreams",
      "Mild gastrointestinal effects",
    ],
    negative: [
      "Diarrhea and nausea (frequently dose-limiting)",
      "Insomnia and vivid dreams",
      "Sexual dysfunction (less than SSRIs but possible)",
      "Discontinuation syndrome on abrupt cessation",
      "Serotonin syndrome with contraindicated combinations",
      "Activation of mania in bipolar patients",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "10mg",
        light: "10-20mg/day",
        common: "20-40mg/day",
        strong: "40mg/day (maximum recommended dose)",
        heavy: "40mg+ (above recommended maximum; increased adverse effects)",
      },
      duration: {
        onset: "2-4 weeks for antidepressant effect",
        comeup: "Weeks of gradual improvement",
        peak: "Steady-state therapeutic benefit after 4-6 weeks",
        offset: "1-2 weeks if discontinued",
        total: "Chronic daily use",
        afterglow: "Unknown",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of serotonin syndrome; at least 14-day washout required",
      "Linezolid or intravenous methylene blue - Serotonergic interaction; discontinue vilazodone during use",
      "Other serotonergic drugs (e.g., tramadol, meperidine, St. John's wort, triptans, SSRIs/SNRIs) - Additive serotonin syndrome risk",
    ],
    unsafe: [
      "Food-deprived dosing - Absorption reduced by approximately 50%; always take with a meal",
      "Strong CYP3A4 inhibitors (e.g., ketoconazole, clarithromycin, ritonavir) - Raise vilazodone exposure; consider dose reduction",
      "Strong CYP3A4 inducers (e.g., carbamazepine, rifampin, phenytoin) - May lower vilazodone levels and reduce efficacy",
      "Antiplatelet or anticoagulant drugs (e.g., aspirin, NSAIDs, warfarin) - Increased bleeding risk",
    ],
    uncertain: [
      "Alcohol - Not formally studied; additive CNS effects possible",
      "Drugs that lower seizure threshold - Theoretical additive risk",
      "CYP2C19 and CYP2D6 substrates - Vilazodone is a weak inhibitor; clinical significance unclear",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Vilazodone must be taken with food. Taking it without food reduces absorption by roughly 50% and may result in inadequate therapeutic effect.",
    "Therapeutic antidepressant effects take 2-4 weeks to appear; continue daily dosing as prescribed and titrate up according to the approved pack schedule (10 mg for 7 days, then 20 mg, then 40 mg if needed).",
    "Allow at least 14 days between discontinuing an MAOI and starting vilazodone, and at least 14 days between stopping vilazodone and starting an MAOI.",
    "Report signs of serotonin syndrome (agitation, tremor, hyperreflexia, fever, sweating, confusion) immediately, particularly when combined with other serotonergic drugs.",
    "Use cautiously in patients with bleeding risk factors or those taking antiplatelet/anticoagulant medications, and in patients with a history of bipolar disorder, mania, or seizures.",
    "Taper gradually when discontinuing to minimize discontinuation symptoms (mood swings, irritability, dizziness, sensory disturbances).",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C26H27N5O2",
    molecularWeight: "441.52 g/mol (freebase); 477.99 g/mol as hydrochloride salt",
    class: "Benzofuran indole / SPARI",
  },
  history:
    "Vilazodone was discovered at Merck KGaA in Darmstadt, Germany and developed clinically by Clinical Data, Inc., which was acquired by Forest Laboratories (now part of AbbVie) in 2011. It was approved by the U.S. FDA in January 2011 for the treatment of major depressive disorder in adults and is marketed under the brand name Viibryd. The molecule was designed to combine SSRI-like serotonin reuptake inhibition with 5-HT1A receptor partial agonism in an effort to provide antidepressant efficacy with improved tolerability, particularly with respect to sexual function.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "low",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Vilazodone",
};
