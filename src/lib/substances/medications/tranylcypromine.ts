import type { Substance } from "../types";

export const tranylcypromine: Substance = {
  id: "tranylcypromine",
  name: "Tranylcypromine",
  commonNames: ["Tranylcypromine", "Parnate"],
  categories: ["medications"],
  class: "MAOI (non-selective, irreversible, non-hydrazine)",
  description:
    "Tranylcypromine is a non-selective, irreversible monoamine oxidase inhibitor (MAOI) of the non-hydrazine class, structurally related to amphetamine, used for major depressive disorder - particularly atypical and treatment-resistant depression. It irreversibly inhibits both MAO-A and MAO-B enzymes, increasing intracellular concentrations of serotonin, norepinephrine, and dopamine. Because enzyme recovery requires synthesis of new enzyme over approximately two weeks, the pharmacodynamic effects persist long after the drug is cleared from plasma. Its amphetamine-like backbone confers mild stimulant properties and may contribute to a faster onset of action compared with hydrazine MAOIs. A strict low-tyramine diet is required to avoid precipitating a hypertensive crisis. Therapeutic antidepressant effects typically require 2 to 6 weeks of continuous daily dosing to fully manifest.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Increased energy and psychomotor activation",
      "Efficacy in atypical and treatment-resistant depression",
      "Reduction of anxiety symptoms",
      "Possibly faster onset than hydrazine MAOIs",
    ],
    neutral: [
      "Amphetamine-like stimulant backbone",
      "Irreversible enzyme inhibition (effects persist ~2 weeks after stopping)",
      "Requires strict dietary tyramine restriction",
      "Short plasma half-life (~2.5 hours) but sustained pharmacodynamic effect",
      "Delayed onset of therapeutic action",
    ],
    negative: [
      "Insomnia",
      "Orthostatic hypotension",
      "Agitation, restlessness, or hypomania",
      "Sexual dysfunction",
      "Weight gain or loss",
      "Risk of hypertensive crisis with tyramine-rich foods or sympathomimetic drugs",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "10mg",
        light: "10-20mg",
        common: "20-40mg",
        strong: "40-60mg",
        heavy: "60mg+",
      },
      duration: {
        onset: "2-6 weeks (therapeutic antidepressant effect)",
        comeup: "Gradual cumulative effect over weeks; some patients report acute stimulation within hours",
        peak: "4-8 weeks for maximal therapeutic response",
        offset: "MAO enzyme activity recovers over approximately 2 weeks after discontinuation",
        total: "Daily divided dosing; pharmacodynamic effects persist for ~2 weeks after stopping",
        afterglow: "Withdrawal symptoms (anxiety, agitation, vivid dreams) may occur if stopped abruptly",
      },
    },
  },
  interactions: {
    dangerous: [
      "Other MAOIs (e.g., phenelzine, selegiline, moclobemide) - Risk of severe hypertensive crisis or serotonin syndrome",
      "SSRIs, SNRIs, TCAs, and other serotonergic antidepressants - Risk of fatal serotonin syndrome; at least 14-day washout required",
      "Linezolid - MAOI activity; risk of serotonin syndrome and hypertensive crisis",
      "Meperidine (pethidine) and tramadol - Risk of severe hyperpyrexia and cardiovascular collapse",
      "Tyramine-rich foods (aged cheeses, cured meats, fermented soy, tap beer, fava beans) - Hypertensive crisis",
      "Sympathomimetic amines (pseudoephedrine, phenylephrine, amphetamines, cocaine) - Hypertensive crisis",
    ],
    unsafe: [
      "Indirect-acting sympathomimetics (e.g., ephedrine) - Hypertensive crisis",
      "Decongestants (oral pseudoephedrine, phenylephrine) - Severe hypertension",
      "Bupropion - Risk of hypertensive crisis",
      "St. John's wort - Increased serotonergic activity",
    ],
    uncertain: [
      "Alcohol (especially tyramine-containing beers and wines) - Hypertensive crisis with tyramine",
      "Insulin and oral hypoglycemics - Tranylcypromine may potentiate hypoglycemia",
      "L-dopa and dopamine agonists - Risk of hypertensive crisis or dyskinesias",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Tranylcypromine requires a strict low-tyramine diet to prevent a potentially fatal hypertensive crisis. Avoid aged cheeses, cured or fermented meats, fermented soy products, fava beans, draft beers, and aged wines. Dietary restrictions must continue for at least 2 weeks after stopping tranylcypromine because enzyme inhibition persists.",
    "At least 14 days must elapse between stopping tranylcypromine and starting another antidepressant (especially SSRIs, SNRIs, or TCAs) to avoid precipitating serotonin syndrome. A 14-day washout is also required before starting tranylcypromine after most other antidepressants.",
    "Carry a medical alert card and inform all healthcare providers that you are taking an MAOI. Avoid all over-the-counter cold, allergy, and weight-loss medications without consulting a pharmacist, as many contain sympathomimetic decongestants that can trigger a hypertensive crisis.",
    "Seek emergency care immediately for severe headache, palpitations, neck stiffness, sweating, nausea, or visual disturbances - these may signal a hypertensive crisis, a life-threatening emergency.",
    "Do not stop tranylcypromine abruptly; taper the dose under medical supervision to reduce withdrawal symptoms. The stimulant-like properties may cause more pronounced agitation during withdrawal.",
    "Use with caution in patients with cardiovascular or cerebrovascular disease, hyperthyroidism, or a history of bipolar disorder (risk of manic switch). Tranylcypromine may increase the risk of suicidal thinking and behavior in young adults; close monitoring is required.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C9H11N",
    molecularWeight: "133.19 g/mol",
    class: "MAOI (non-selective, irreversible, non-hydrazine)",
  },
  history:
    "Tranylcypromine was originally synthesized in 1948 as an intermediate in the study of amphetamine analogues, and its MAO-inhibiting properties were discovered serendipitously during antitubercular drug research in the late 1950s. It was developed by Smith Kline & French (now GlaxoSmithKline) and received FDA approval in 1961, marketed under the brand name Parnate. Although withdrawn briefly in 1964 due to reports of hypertensive crises (later understood to be food-interaction-related), it was reintroduced and remains a key option for treatment-resistant and atypical depression.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "high",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Tranylcypromine",
};
