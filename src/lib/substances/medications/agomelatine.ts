import type { Substance } from "../types";

export const agomelatine: Substance = {
  id: "agomelatine",
  name: "Agomelatine",
  commonNames: ["Agomelatine", "Valdoxan", "Melitor", "Theranex"],
  categories: ["medications"],
  class: "Melatonin receptor agonist / 5-HT2C antagonist",
  description:
    "Agomelatine is an atypical antidepressant with a novel mechanism: it is a potent agonist at MT1 and MT2 melatonin receptors and an antagonist at 5-HT2C serotonin receptors. The melatonergic agonism resynchronizes circadian rhythms and improves sleep architecture, while 5-HT2C antagonism enhances frontocortical dopamine and norepinephrine release, contributing to the antidepressant effect. It is indicated for major depressive disorder in adults at 25 mg once daily at bedtime, increasing to 50 mg/day if needed. A critical safety requirement is hepatotoxicity monitoring: agomelatine can cause significant elevations in serum transaminases and rare cases of severe liver injury, so liver function tests must be performed at baseline and at 6 weeks, 12 weeks, 6 months, and thereafter as clinically indicated. Agomelatine is contraindicated in hepatic impairment and in patients taking other hepatotoxic drugs. It is approved in the European Union, Australia, and many other countries but is not approved by the U.S. FDA.",
  effects: {
    positive: [
      "Mood improvement (with chronic use)",
      "Improved sleep onset and circadian rhythm",
      "Anxiolysis",
      "Lack of sexual dysfunction compared to SSRIs",
      "Generally weight-neutral",
      "Lack of discontinuation syndrome",
    ],
    neutral: [
      "Once-daily bedtime dosing aligned with circadian biology",
      "Delayed onset of therapeutic effect over weeks",
      "Mild gastrointestinal effects",
      "Sedation linked to melatonergic activity",
    ],
    negative: [
      "Hepatotoxicity (transaminase elevations; rare severe liver injury)",
      "Headache and dizziness",
      "Nausea and abdominal pain",
      "Somnolence and fatigue",
      "Anxiety and abnormal dreams",
      "Contraindicated in hepatic impairment",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "12.5mg (initiation or dose-splitting)",
        light: "25mg at bedtime (standard starting dose)",
        common: "25-50mg/day at bedtime",
        strong: "50mg/day at bedtime (maximum recommended dose)",
        heavy: "50mg+ (above recommended maximum; increased hepatotoxicity risk)",
      },
      duration: {
        onset: "2-4 weeks for antidepressant effect; sleep benefits often within first week",
        comeup: "Weeks of gradual mood improvement",
        peak: "Steady-state therapeutic benefit after 4-6 weeks",
        offset: "1-2 weeks if discontinued",
        total: "Chronic daily use, taken at bedtime",
        afterglow: "Unknown",
      },
    },
  },
  interactions: {
    dangerous: [
      "Concurrent hepatotoxic drugs (e.g., high-dose acetaminophen, valproate, isoniazid, methotrexate, anabolic steroids) - Additive hepatotoxicity",
      "Hepatic impairment (any cause) - Contraindicated; risk of severe liver injury",
      "Strong CYP1A2 inhibitors (e.g., fluvoxamine, ciprofloxacin, enoxacin) - Markedly raise agomelatine exposure; coadministration is contraindicated",
    ],
    unsafe: [
      "Alcohol - Additive hepatic risk; avoid during treatment",
      "Moderate CYP1A2 inhibitors (e.g., oral contraceptives containing ethinylestradiol) - May raise agomelatine levels",
      "CYP1A2 inducers (e.g., tobacco smoking, omeprazole, modafinil) - May lower agomelatine levels and reduce efficacy",
    ],
    uncertain: [
      "MAOIs - Not formally studied; theoretical serotonergic interaction",
      "Other antidepressants - Limited data; combination generally not recommended",
      "Anticoagulants - Theoretical interaction; monitor if combined",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Agomelatine can cause clinically significant elevations in serum transaminases and rare cases of severe liver injury. Perform liver function tests at baseline, 6 weeks, 12 weeks, 6 months, and periodically thereafter, and discontinue if ALT or AST exceeds 3 times the upper limit of normal.",
    "Agomelatine is contraindicated in patients with hepatic impairment (any Child-Pugh class) and in those taking other hepatotoxic medications or who consume significant amounts of alcohol.",
    "Coadministration with strong CYP1A2 inhibitors such as fluvoxamine or ciprofloxacin is contraindicated because they markedly increase agomelatine plasma concentrations.",
    "Take the dose once daily at bedtime; the melatonergic activity can cause drowsiness, and timing aligns with the drug's circadian-resynchronizing mechanism.",
    "Patients should be advised to seek medical attention promptly if they develop signs of liver injury such as jaundice, dark urine, right upper quadrant pain, fatigue, or anorexia.",
    "Agomelatine is not approved by the U.S. FDA; availability is limited to the EU, Australia, and other jurisdictions where it has received regulatory approval.",
  ],
  legality: "Approved for prescription use in the European Union, Australia, and many other countries; not approved by the U.S. FDA and is unavailable in the United States.",
  chemistry: {
    formula: "C15H17NO2",
    molecularWeight: "243.30 g/mol",
    class: "Naphthalene derivative / Melatonin receptor agonist",
  },
  history:
    "Agomelatine was developed by the French pharmaceutical company Servier, with chemistry inspired by the structure of the endogenous hormone melatonin; it was designed to combine melatonergic agonism with 5-HT2C antagonism to address both circadian disruption and depressed mood. It received marketing authorization from the European Medicines Agency in February 2009 and has since been approved in many countries worldwide, including Australia and Russia. After a series of regulatory submissions, Servier withdrew the U.S. marketing application; the drug has never been approved by the FDA, primarily because of concerns about hepatotoxicity relative to placebo.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Agomelatine",
};
