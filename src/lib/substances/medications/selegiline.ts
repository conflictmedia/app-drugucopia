import type { Substance } from "../types";

export const selegiline: Substance = {
  id: "selegiline",
  name: "Selegiline",
  commonNames: ["Selegiline", "Eldepryl", "Zelapar", "Emsam", "Deprenyl"],
  categories: ["medications"],
  class: "MAOI (selective MAO-B at low oral doses; non-selective at higher oral doses; transdermal for MDD)",
  description:
    "Selegiline (also known as L-deprenyl) is a monoamine oxidase inhibitor used in two distinct clinical contexts: at low oral doses (typically 5-10 mg/day) it selectively inhibits MAO-B and is used as an adjunct to levodopa in Parkinson's disease, while at higher oral doses and via transdermal patch it inhibits both MAO-A and MAO-B and is used to treat major depressive disorder. The transdermal Emsam patch (6, 9, or 12 mg per 24 hours) bypasses first-pass hepatic metabolism and achieves MAO-A inhibition in the brain while sparing MAO-A in the gut at the lowest 6 mg/24h dose, eliminating the need for dietary tyramine restriction at that dose. At higher doses (oral above 10 mg/day or patch 9-12 mg/24h), tyramine restriction is required. Selegiline is metabolized to amphetamine and methamphetamine, which contributes to its mild stimulant effects. Therapeutic antidepressant effects typically require 2 to 6 weeks of continuous daily dosing to fully manifest.",
  effects: {
    positive: [
      "Mood elevation (with chronic use, particularly via transdermal route)",
      "Improved motor function in Parkinson's disease (oral adjunct use)",
      "Mild psychostimulation (attributable to amphetamine metabolites)",
      "Possible neuroprotective effects in Parkinson's disease",
      "Efficacy in treatment-resistant depression at higher doses",
    ],
    neutral: [
      "Selective MAO-B inhibition at low oral doses (10 mg/day or less)",
      "Non-selective MAO inhibition at higher oral doses and via transdermal route",
      "Amphetamine and methamphetamine metabolites",
      "No dietary tyramine restriction at 6 mg/24h transdermal dose",
      "Delayed onset of therapeutic action",
    ],
    negative: [
      "Insomnia (especially with evening dosing)",
      "Orthostatic hypotension",
      "Dry mouth and nausea",
      "Anxiety or agitation",
      "Vivid dreams",
      "Risk of hypertensive crisis with tyramine-rich foods at higher doses",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "2.5mg",
        light: "5-10mg",
        common: "10-20mg",
        strong: "20-40mg",
        heavy: "40mg+",
      },
      duration: {
        onset: "1-3 hours (acute plasma); 2-6 weeks (therapeutic antidepressant effect at higher doses)",
        comeup: "Acute stimulation within hours; gradual cumulative antidepressant effect over weeks",
        peak: "4-8 weeks for maximal therapeutic antidepressant response",
        offset: "MAO enzyme activity recovers over approximately 2 weeks after discontinuation",
        total: "Daily dosing; pharmacodynamic effects persist for ~2 weeks after stopping",
        afterglow: "Mild stimulation may persist briefly; withdrawal symptoms are uncommon at low doses",
      },
    },
    transdermal: {
      dosage: {
        threshold: "3mg/24h",
        light: "6mg/24h",
        common: "6-9mg/24h",
        strong: "9-12mg/24h",
        heavy: "12mg/24h+",
      },
      duration: {
        onset: "2-6 weeks (therapeutic antidepressant effect)",
        comeup: "Gradual cumulative effect over weeks",
        peak: "4-8 weeks for maximal therapeutic response",
        offset: "MAO enzyme activity recovers over approximately 2 weeks after patch discontinuation",
        total: "Patch applied once daily; pharmacodynamic effects persist for ~2 weeks after stopping",
        afterglow: "Withdrawal symptoms (anxiety, agitation) may occur if stopped abruptly",
      },
    },
  },
  interactions: {
    dangerous: [
      "Other MAOIs (e.g., phenelzine, tranylcypromine, moclobemide) - Risk of severe hypertensive crisis or serotonin syndrome",
      "SSRIs, SNRIs, TCAs, and other serotonergic antidepressants - Risk of fatal serotonin syndrome; at least 14-day washout required (5 weeks for fluoxetine)",
      "Linezolid - MAOI activity; risk of serotonin syndrome and hypertensive crisis",
      "Meperidine (pethidine) and tramadol - Risk of severe hyperpyrexia and cardiovascular collapse",
      "Tyramine-rich foods (required at oral doses above 10 mg/day and at transdermal doses 9 mg/24h or higher) - Hypertensive crisis",
      "Sympathomimetic amines (pseudoephedrine, phenylephrine, amphetamines, cocaine) - Hypertensive crisis",
    ],
    unsafe: [
      "Indirect-acting sympathomimetics (e.g., ephedrine) - Hypertensive crisis",
      "Decongestants (oral pseudoephedrine, phenylephrine) - Severe hypertension (caution at all doses)",
      "Bupropion - Risk of hypertensive crisis",
      "St. John's wort - Increased serotonergic activity",
      "Meperidine analogues (dextromethorphan at high doses, methadone) - Risk of serotonin syndrome",
    ],
    uncertain: [
      "Alcohol - Disulfiram-like reaction reported with some formulations; potential tyramine interaction with tap beers and aged wines",
      "Levodopa and dopamine agonists - May potentiate dyskinesias in Parkinson's disease; dose adjustment may be required",
      "CYP2B6 and CYP3A4 inhibitors - May raise selegiline plasma levels",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "At oral doses above 10 mg/day or with the 9 mg/24h and 12 mg/24h transdermal patches, selegiline requires a strict low-tyramine diet to prevent a potentially fatal hypertensive crisis. The 6 mg/24h transdermal patch does not require dietary tyramine restriction, but tyramine-rich foods should still be moderated.",
    "At least 14 days must elapse between stopping selegiline and starting another antidepressant (especially SSRIs, SNRIs, or TCAs) to avoid precipitating serotonin syndrome. A 5-week washout is required when switching from fluoxetine to selegiline.",
    "Carry a medical alert card and inform all healthcare providers that you are taking an MAOI. Avoid all over-the-counter cold, allergy, and weight-loss medications without consulting a pharmacist, as many contain sympathomimetic decongestants that can trigger a hypertensive crisis.",
    "Seek emergency care immediately for severe headache, palpitations, neck stiffness, sweating, nausea, or visual disturbances - these may signal a hypertensive crisis, a life-threatening emergency.",
    "Take oral selegiline in the morning and at midday (not evening) to minimize insomnia from its amphetamine-like metabolites. Apply the transdermal patch to dry, intact skin and rotate application sites to avoid skin irritation.",
    "Use with caution in patients with cardiovascular or cerebrovascular disease, hyperthyroidism, or bipolar disorder (risk of manic switch). Selegiline may increase the risk of suicidal thinking and behavior in young adults; close monitoring is required.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C13H17N",
    molecularWeight: "187.28 g/mol",
    class: "MAOI (selective MAO-B at low oral doses; non-selective at higher oral doses; transdermal for MDD)",
  },
  history:
    "Selegiline (originally known as L-deprenyl) was first synthesized in 1962 by Jozsef Knoll and colleagues at Semmelweis University in Budapest, Hungary. It was developed as a selective MAO-B inhibitor for Parkinson's disease and received its first regulatory approval for that indication in Hungary in 1977 and subsequent FDA approval for oral Parkinson's use in 1989 (brand name Eldepryl). The transdermal selegiline system (brand name Emsam), developed by Somerset Pharmaceuticals and Bristol-Myers Squibb, was approved by the FDA in 2006 for the treatment of major depressive disorder, representing the first transdermal MAOI.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "high",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Selegiline",
};
