import type { Substance } from "../types";

export const phenelzine: Substance = {
  id: "phenelzine",
  name: "Phenelzine",
  commonNames: ["Phenelzine", "Nardil"],
  categories: ["medications"],
  class: "MAOI (non-selective, irreversible, hydrazine)",
  description:
    "Phenelzine is a non-selective, irreversible monoamine oxidase inhibitor (MAOI) of the hydrazine class, used primarily for treatment-resistant major depressive disorder and atypical depression, and particularly effective for panic disorder and social anxiety disorder. It irreversibly inhibits both MAO-A and MAO-B enzymes, increasing intracellular concentrations of serotonin, norepinephrine, and dopamine. Because enzyme recovery requires synthesis of new enzyme over approximately two weeks, the pharmacodynamic effects persist long after the drug is cleared from plasma. A strict low-tyramine diet is required to avoid precipitating a hypertensive crisis. Therapeutic antidepressant effects typically require 2 to 6 weeks of continuous daily dosing to fully manifest.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Reduction of panic attacks and phobic anxiety",
      "Efficacy in atypical depression with reversed neurovegetative features",
      "Useful in treatment-resistant depression",
      "May produce more pronounced mood brightening than SSRIs",
    ],
    neutral: [
      "Irreversible enzyme inhibition (effects persist ~2 weeks after stopping)",
      "Delayed onset of therapeutic action",
      "Requires strict dietary tyramine restriction",
      "Marked interpatient variability in metabolism (acetylator phenotype)",
    ],
    negative: [
      "Orthostatic hypotension",
      "Weight gain and edema",
      "Sexual dysfunction",
      "Insomnia or somnolence",
      "Pyridoxine (vitamin B6) deficiency with prolonged use",
      "Risk of hypertensive crisis with tyramine-rich foods or sympathomimetic drugs",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "15mg",
        light: "15-30mg",
        common: "30-60mg",
        strong: "60-90mg",
        heavy: "90mg+",
      },
      duration: {
        onset: "2-6 weeks (therapeutic antidepressant effect)",
        comeup: "Gradual cumulative effect over weeks",
        peak: "4-8 weeks for maximal therapeutic response",
        offset: "MAO enzyme activity recovers over approximately 2 weeks after discontinuation",
        total: "Daily dosing; pharmacodynamic effects persist for ~2 weeks after stopping",
        afterglow: "Withdrawal symptoms (anxiety, agitation, vivid dreams) may occur if stopped abruptly",
      },
    },
  },
  interactions: {
    dangerous: [
      "Other MAOIs (e.g., tranylcypromine, selegiline, moclobemide) - Risk of severe hypertensive crisis or serotonin syndrome",
      "SSRIs, SNRIs, TCAs, and other serotonergic antidepressants - Risk of fatal serotonin syndrome; at least 14-day washout required",
      "Linezolid - MAOI activity; risk of serotonin syndrome and hypertensive crisis",
      "Meperidine (pethidine) and tramadol - Risk of severe hyperpyrexia and cardiovascular collapse",
      "Tyramine-rich foods (aged cheeses, cured meats, fermented soy, tap beer, fava beans) - Hypertensive crisis",
      "Sympathomimetic amines (pseudoephedrine, phenylephrine, amphetamines, cocaine) - Hypertensive crisis",
    ],
    unsafe: [
      "Indirect-acting sympathomimetics (e.g., ephedrine) - Hypertensive crisis",
      "Decongestants (oral pseudoephedrine, phenylephrine) - Severe hypertension",
      "St. John's wort - Increased serotonergic activity",
      "Bupropion - Risk of hypertensive crisis",
    ],
    uncertain: [
      "Alcohol (especially tyramine-containing beers and wines) - Disulfiram-like reactions and hypertensive crisis with tyramine",
      "Insulin and oral hypoglycemics - Phenelzine may potentiate hypoglycemia",
      "Antihypertensives - Risk of paradoxical hypertension or exaggerated hypotension",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Phenelzine requires a strict low-tyramine diet to prevent a potentially fatal hypertensive crisis. Avoid aged cheeses, cured or fermented meats, fermented soy products, fava beans, draft beers, and aged wines. Dietary restrictions must continue for at least 2 weeks after stopping phenelzine because enzyme inhibition persists.",
    "At least 14 days must elapse between stopping phenelzine and starting another antidepressant (especially SSRIs, SNRIs, or TCAs) to avoid precipitating serotonin syndrome. A 14-day washout is also required before starting phenelzine after most other antidepressants.",
    "Carry a medical alert card and inform all healthcare providers that you are taking an MAOI. Avoid all over-the-counter cold, allergy, and weight-loss medications without consulting a pharmacist, as many contain sympathomimetic decongestants that can trigger a hypertensive crisis.",
    "Seek emergency care immediately for severe headache, palpitations, neck stiffness, sweating, nausea, or visual disturbances - these may signal a hypertensive crisis, a life-threatening emergency.",
    "Do not stop phenelzine abruptly; taper the dose under medical supervision to reduce withdrawal symptoms. Pyridoxine (vitamin B6) supplementation is sometimes advised for long-term users.",
    "Use with caution in patients with cardiovascular disease, cerebrovascular disease, pheochromocytoma, or hepatic impairment. Phenelzine may increase the risk of suicidal thinking and behavior in young adults; close monitoring is required.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C8H12N2",
    molecularWeight: "136.19 g/mol",
    class: "MAOI (non-selective, irreversible, hydrazine)",
  },
  history:
    "Phenelzine was first synthesized in the 1950s as a hydrazine derivative of phenylethylamine and was developed by Parke-Davis (now part of Pfizer). It received FDA approval on June 9, 1961, becoming one of the earliest MAOI antidepressants available in the United States, marketed under the brand name Nardil. Although newer antidepressants have largely displaced MAOIs as first-line therapy, phenelzine retains a niche role for atypical depression and treatment-refractory anxiety disorders. The brand-name Nardil formulation underwent a manufacturing change in 2003 that prompted widespread patient reports of reduced efficacy.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "high",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Phenelzine",
};
