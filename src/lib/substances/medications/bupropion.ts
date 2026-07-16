import type { Substance } from "../types";

export const bupropion: Substance = {
  id: "bupropion",
  name: "Bupropion",
  commonNames: ["Bupropion", "Wellbutrin", "Zyban", "Wellbutrin XL", "Wellbutrin SR", "Aplenzin"],
  categories: ["medications"],
  class: "NDRI (Norepinephrine-dopamine reuptake inhibitor)",
  description:
    "Bupropion is an atypical antidepressant that acts as a norepinephrine-dopamine reuptake inhibitor (NDRI) with minimal direct effect on serotonin. It is primarily indicated for major depressive disorder, seasonal affective disorder, and (under the brand Zyban) as an aid to smoking cessation. It is also used off-label for attention-deficit/hyperactivity disorder. Unlike many antidepressants, bupropion tends to be activating rather than sedating and is associated with weight loss rather than weight gain, and it lacks the sexual dysfunction common to SSRIs. A key safety limitation is that bupropion lowers the seizure threshold in a dose-dependent manner; the maximum recommended daily dose is 450 mg (300 mg for Wellbutrin XL), and the drug is contraindicated in patients with current or prior eating disorders (bulimia or anorexia nervosa), active seizure disorders, or those undergoing acute alcohol or benzodiazepine withdrawal.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Increased energy and motivation",
      "Improved concentration and focus",
      "Reduced nicotine craving (as smoking-cessation aid)",
      "Weight-neutral or weight loss",
      "Lack of sexual dysfunction compared to SSRIs",
    ],
    neutral: [
      "Mild stimulant-like activation",
      "Insomnia (frequently dose-limiting)",
      "Decreased appetite",
      "Sweating",
      "Tremor",
    ],
    negative: [
      "Seizures (dose-dependent risk, especially above 450 mg/day)",
      "Insomnia and agitation",
      "Anxiety and irritability",
      "Dry mouth and headache",
      "Hypertension (particularly with nicotine patches)",
      "Psychosis or mania in susceptible individuals",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "75mg",
        light: "150mg/day",
        common: "300mg/day",
        strong: "450mg/day (max for generic/SR formulations)",
        heavy: "450mg+ (severe seizure risk; above the recommended maximum)",
      },
      duration: {
        onset: "2-4 weeks for antidepressant effect",
        comeup: "Days to weeks of gradual improvement",
        peak: "Steady-state therapeutic benefit after 4-6 weeks",
        offset: "1-2 weeks if discontinued",
        total: "Chronic daily use",
        afterglow: "Unknown",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of hypertensive crisis; at least 14-day washout required",
      "Other bupropion-containing products (e.g., Wellbutrin + Zyban) - Dose stacking causes seizures",
      "Linezolid or methylene blue - Serotonergic / hypertensive risk",
    ],
    unsafe: [
      "Drugs that lower seizure threshold (e.g., tramadol, theophylline, systemic corticosteroids, antipsychotics) - Additive seizure risk",
      "Alcohol - Lowers seizure threshold; abrupt alcohol cessation while taking bupropion is contraindicated",
      "CYP2D6 substrates (e.g., paroxetine, fluoxetine, metoprolol) - Bupropion inhibits CYP2D6 and can sharply raise their levels",
      "Nicotine replacement therapy - May cause treatment-emergent hypertension",
    ],
    uncertain: [
      "Tamoxifen - Bupropion inhibits CYP2D6 and may reduce formation of active endoxifen",
      "CYP2B6 inducers (e.g., rifampin, efavirenz) - May lower bupropion levels",
      "Antiretrovirals (e.g., efavirenz, ritonavir) - Variable effects on bupropion metabolism",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Bupropion lowers the seizure threshold in a dose-dependent manner. Do not exceed 450 mg/day (300 mg/day for Wellbutrin XL), and never combine multiple bupropion-containing products (e.g., Wellbutrin with Zyban).",
    "Bupropion is contraindicated in patients with current or prior bulimia or anorexia nervosa because of a markedly elevated seizure risk in this population.",
    "It is also contraindicated during acute alcohol or benzodiazepine/sedative withdrawal, or in patients with active seizure disorders or known CNS lesions predisposing to seizures.",
    "Space immediate-release doses at least 4-6 hours apart, and never split, crush, or chew extended-release tablets, as this can cause dose dumping and seizures.",
    "A minimum 14-day washout is required between stopping any MAOI and starting bupropion (and vice versa).",
    "Bupropion can cause insomnia; taking doses earlier in the day and avoiding evening dosing of SR/XL formulations reduces this. Notify a prescriber of new agitation, anxiety, or suicidal thoughts, especially during the first weeks of treatment.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C13H18ClNO",
    molecularWeight: "239.74 g/mol (freebase); 276.2 g/mol as hydrochloride salt",
    class: "Aminoketone / NDRI",
  },
  history:
    "Bupropion was first synthesized in 1969 by Nariman Mehta at Burroughs Wellcome (now GlaxoSmithKline) and was initially investigated as an antipsychotic before its antidepressant activity was recognized. It was approved by the U.S. FDA in 1985 as an antidepressant but was temporarily withdrawn in 1986 because of seizure concerns at higher doses, returning to the market in 1989 with a revised dosing limit of 450 mg/day. An extended-release formulation (Wellbutrin XL) was approved in 2003, and the same molecule was approved for smoking cessation under the brand name Zyban in 1997.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Bupropion",
};
