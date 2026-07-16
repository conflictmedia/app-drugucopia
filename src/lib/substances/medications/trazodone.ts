import type { Substance } from "../types";

export const trazodone: Substance = {
  id: "trazodone",
  name: "Trazodone",
  commonNames: ["Trazodone", "Desyrel", "Oleptro", "Trialodine"],
  categories: ["medications"],
  class: "SARI (Serotonin antagonist and reuptake inhibitor)",
  description:
    "Trazodone is a serotonin antagonist and reuptake inhibitor (SARI) used primarily for major depressive disorder, though its most common contemporary use is off-label as a hypnotic for insomnia. It acts as a serotonin reuptake inhibitor and a potent antagonist at 5-HT2A, alpha-1 adrenergic, and H1 histamine receptors; the latter two actions account for its pronounced sedative effects. Because of this sedation, it is frequently prescribed at low doses (25-100 mg) at bedtime for sleep, while the full antidepressant dose range is 150-400 mg/day. A clinically important but rare adverse effect is priapism (prolonged, painful erection), which is a urologic emergency. Trazodone has minimal anticholinergic burden compared to tricyclic antidepressants and is generally less toxic in overdose than TCAs, though it can prolong the QT interval at higher doses.",
  effects: {
    positive: [
      "Mood improvement (with chronic use at antidepressant doses)",
      "Sleep onset and maintenance (especially at low doses)",
      "Anxiolysis",
      "Low anticholinergic burden compared to TCAs",
      "Relatively lower overdose toxicity than tricyclics",
    ],
    neutral: [
      "Marked sedation and next-day grogginess",
      "Vivid dreams or nightmares",
      "Mild orthostatic hypotension",
      "Decreased REM sleep architecture",
    ],
    negative: [
      "Priapism (rare but serious urologic emergency)",
      "Excessive daytime sedation",
      "Dizziness and lightheadedness",
      "QT prolongation at higher doses",
      "Sexual dysfunction (less than SSRIs but still reported)",
      "Paradoxical insomnia or agitation at higher doses",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "25mg (hypnotic dose)",
        light: "50-100mg (insomnia / low-end)",
        common: "150-300mg/day (depression)",
        strong: "300-400mg/day (upper depression range)",
        heavy: "400mg+ (above recommended maximum; QT-prolongation risk)",
      },
      duration: {
        onset: "30-60 minutes (sedation); 2-4 weeks (antidepressant effect)",
        comeup: "Days to weeks of gradual mood improvement",
        peak: "Steady-state therapeutic benefit after 2-4 weeks",
        offset: "1-2 weeks if discontinued",
        total: "Chronic daily use (typically once nightly for insomnia)",
        afterglow: "Unknown",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of serotonin syndrome; 14-day washout required",
      "Other QT-prolonging drugs (e.g., amiodarone, sotalol, certain antipsychotics, methadone, macrolides) - Additive QT prolongation, rare torsades de pointes",
      "Strong CYP3A4 inhibitors (e.g., ketoconazole, itraconazole, ritonavir, clarithromycin) - Markedly raise trazodone exposure",
    ],
    unsafe: [
      "Alcohol - Additive CNS and respiratory depression; increased sedation",
      "Benzodiazepines and other sedatives - Additive sedation and impairment",
      "Antihypertensives and alpha-1 blockers - Additive orthostatic hypotension",
      "Warfarin - Altered anticoagulant effect; monitor INR",
    ],
    uncertain: [
      "SSRIs/SNRIs - Additive serotonergic effects, rare serotonin syndrome",
      "Digoxin or phenytoin - Trazodone may raise serum levels of these",
      "Carbamazepine and other CYP3A4 inducers - May lower trazodone levels",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Because of significant sedation, trazodone should usually be taken at bedtime; patients should avoid driving or operating machinery until they understand how the drug affects them.",
    "Priapism is a rare but well-recognized adverse effect (more common in males and at higher doses). Any erection lasting more than 4 hours requires immediate emergency medical attention to prevent permanent erectile tissue damage.",
    "Trazodone can cause orthostatic hypotension, dizziness, and syncope, particularly in older adults; rise slowly from sitting or lying positions.",
    "A minimum 14-day washout is required between stopping an MAOI and starting trazodone (and vice versa) to avoid serotonin syndrome.",
    "Use caution with other QT-prolonging medications and in patients with cardiac disease or electrolyte abnormalities; an ECG may be warranted at higher doses.",
    "Trazodone should be tapered rather than abruptly discontinued, particularly after long-term use at antidepressant doses, to minimize withdrawal symptoms.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C19H22ClN5O",
    molecularWeight: "371.86 g/mol (freebase); 408.32 g/mol as hydrochloride salt",
    class: "Phenylpiperazine / SARI",
  },
  history:
    "Trazodone was synthesized in the 1960s by Bruno Silvestrini and co-workers at the Italian research institute Angelini Francesco and was first marketed in Italy in 1972 before receiving U.S. FDA approval in 1981 for the treatment of major depression. Although introduced as a second-generation antidepressant with a more favorable safety profile than tricyclics, its off-label use as a hypnotic has since come to dominate prescribing. An extended-release once-daily formulation (Oleptro) was approved in the United States in 2009.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Trazodone",
};
