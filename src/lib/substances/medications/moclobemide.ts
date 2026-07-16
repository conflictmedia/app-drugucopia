import type { Substance } from "../types";

export const moclobemide: Substance = {
  id: "moclobemide",
  name: "Moclobemide",
  commonNames: ["Moclobemide", "Manerix", "Aurorix"],
  categories: ["medications"],
  class: "MAOI (reversible, MAO-A selective / RIMA)",
  description:
    "Moclobemide is a reversible inhibitor of monoamine oxidase A (RIMA), a subclass of MAOI that selectively and reversibly inhibits the MAO-A isoenzyme, increasing synaptic concentrations of serotonin, norepinephrine, and dopamine. Its reversibility means that dietary tyramine can still displace moclobemide from MAO-A, markedly reducing - but not eliminating - the risk of tyramine-induced hypertensive crisis compared with older irreversible MAOIs. It is approved for major depressive disorder and social anxiety disorder in many countries, though it is not approved for use in the United States. Because enzyme function recovers within 24 to 48 hours of stopping the drug, washout periods are shorter than for irreversible MAOIs. Therapeutic antidepressant effects typically require 2 to 6 weeks of continuous daily dosing to fully manifest.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Efficacy in social anxiety disorder",
      "Lower dietary tyramine restriction than irreversible MAOIs",
      "Generally less sedating than tricyclics",
    ],
    neutral: [
      "Reversible inhibition (enzyme recovery within 24-48 hours)",
      "MAO-A selective",
      "Short plasma half-life (~2 hours) requiring divided daily dosing",
      "Delayed onset of therapeutic action",
    ],
    negative: [
      "Insomnia",
      "Nausea and dry mouth",
      "Headache",
      "Restlessness or agitation",
      "Dizziness",
      "Hypertensive reactions with high tyramine intake or sympathomimetics (rare but possible)",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "75mg",
        light: "75-150mg",
        common: "150-300mg",
        strong: "300-450mg",
        heavy: "450-600mg+",
      },
      duration: {
        onset: "1-2 hours (acute plasma); 2-6 weeks (therapeutic antidepressant effect)",
        comeup: "Gradual cumulative antidepressant effect over weeks",
        peak: "4-8 weeks for maximal therapeutic response",
        offset: "MAO-A enzyme activity recovers within 24-48 hours after discontinuation",
        total: "Twice-daily dosing (short half-life ~2 hours)",
        afterglow: "Withdrawal symptoms are uncommon but may include mild anxiety or insomnia",
      },
    },
  },
  interactions: {
    dangerous: [
      "Other MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe hypertensive crisis or serotonin syndrome",
      "SSRIs, SNRIs, TCAs, and other serotonergic antidepressants - Risk of serotonin syndrome; washout period required",
      "Linezolid - MAOI activity; risk of serotonin syndrome",
      "Meperidine (pethidine) and tramadol - Risk of severe hyperpyrexia and cardiovascular collapse",
      "Sympathomimetic amines (pseudoephedrine, phenylephrine, amphetamines, cocaine) - Hypertensive crisis",
    ],
    unsafe: [
      "Indirect-acting sympathomimetics (e.g., ephedrine) - Hypertensive crisis",
      "Oral decongestants (pseudoephedrine, phenylephrine) - Severe hypertension",
      "Tyramine-rich foods (in large quantities) - Hypertensive reactions are possible, though less severe than with irreversible MAOIs",
      "St. John's wort - Increased serotonergic activity",
      "Bupropion - Risk of hypertensive crisis",
    ],
    uncertain: [
      "Alcohol - Limited data; caution advised, especially with tyramine-containing beers and wines",
      "CYP2C19 and CYP2D6 substrates - Moclobemide may modestly inhibit metabolism of co-administered drugs",
      "Insulin and oral hypoglycemics - Moclobemide may potentiate hypoglycemia",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Moclobemide does not require the strict tyramine-free diet mandated by irreversible MAOIs at usual therapeutic doses, but patients should still avoid consuming very large quantities of tyramine-rich foods (aged cheeses, cured meats, fermented soy products, aged wines, and tap beers) in a single sitting.",
    "At least 24 to 48 hours should elapse between stopping moclobemide and starting another antidepressant (SSRIs, SNRIs, or TCAs). When switching from another antidepressant to moclobemide, a longer washout is required: at least 14 days for most antidepressants and 5 weeks for fluoxetine.",
    "Carry a medical alert card and inform all healthcare providers that you are taking an MAOI. Avoid all over-the-counter cold, allergy, and weight-loss medications without consulting a pharmacist, as many contain sympathomimetic decongestants that can trigger a hypertensive crisis.",
    "Seek emergency care immediately for severe headache, palpitations, neck stiffness, sweating, nausea, or visual disturbances - these may signal a hypertensive crisis, a life-threatening emergency.",
    "Moclobemide should be taken after meals to reduce the risk of tyramine interactions and to improve tolerability. Divide the daily dose (typically twice daily) due to its short half-life.",
    "Use with caution in patients with cardiovascular disease, hyperthyroidism, hepatic impairment, or bipolar disorder (risk of manic switch). Moclobemide may increase the risk of suicidal thinking and behavior in young adults; close monitoring is required.",
  ],
  legality: "Prescription medication in most jurisdictions (not approved in the United States).",
  chemistry: {
    formula: "C13H17ClN2O2",
    molecularWeight: "268.74 g/mol",
    class: "MAOI (reversible, MAO-A selective / RIMA)",
  },
  history:
    "Moclobemide was developed by Hoffmann-La Roche and first approved in Switzerland in 1989 (later introduced across Europe, Canada, Australia, and other markets under the brand names Aurorix and Manerix). It was designed as a safer, reversible alternative to the older irreversible MAOIs, eliminating much of the dietary restriction burden while preserving antidepressant efficacy. Despite its favorable safety profile, Roche did not pursue FDA approval in the United States after a 1990s Phase III trial failed to demonstrate clear superiority over placebo, and the drug remains unavailable commercially in the US.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "high",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Moclobemide",
};
