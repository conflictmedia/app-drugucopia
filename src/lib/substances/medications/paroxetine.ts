import type { Substance } from "../types";

export const paroxetine: Substance = {
  id: "paroxetine",
  name: "Paroxetine",
  commonNames: ["Paroxetine", "Paxil", "Seroxat", "Aropax"],
  categories: ["medications"],
  class: "SSRI",
  description:
    "Paroxetine is a selective serotonin reuptake inhibitor (SSRI) indicated for major depressive disorder, obsessive-compulsive disorder, panic disorder, social anxiety disorder, generalized anxiety disorder, and post-traumatic stress disorder. It is one of the most potent SSRIs at the serotonin transporter and also has mild anticholinergic and noradrenergic activity, contributing to its side-effect and withdrawal profile. Therapeutic effects typically appear 2 to 6 weeks after initiating daily therapy. Paroxetine is particularly notorious among SSRIs for a severe and prolonged discontinuation syndrome due to its short half-life and lack of an active metabolite.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Marked anxiety reduction",
      "Reduced panic attack frequency",
      "Decreased intrusive and obsessive thoughts",
      "Improved sleep in anxious depression",
    ],
    neutral: [
      "Delayed onset of therapeutic action (2-6 weeks)",
      "Sedation or somnolence",
      "Dry mouth (mild anticholinergic effect)",
      "Vivid dreams",
      "Sweating",
    ],
    negative: [
      "Sexual dysfunction (anorgasmia, decreased libido)",
      "Weight gain",
      "Nausea and constipation",
      "Severe discontinuation syndrome ('brain zaps', dizziness)",
      "Risk of serotonin syndrome with serotonergic co-ingestants",
      "Possible increased suicidality in young adults during early therapy",
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
        onset: "2-4 weeks (therapeutic effects)",
        comeup: "1-2 weeks (initial improvements)",
        peak: "4-8 weeks (full therapeutic effect)",
        offset: "1-2 days (per dose half-life ~21 hours)",
        total: "Months to years (chronic therapy)",
        afterglow: "Discontinuation may produce withdrawal symptoms lasting weeks",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe serotonin syndrome; at least 14-day washout required",
      "Pimozide / thioridazine - Risk of QT prolongation and fatal arrhythmia (paroxetine inhibits CYP2D6)",
      "Other SSRIs, SNRIs, and serotonergic agents - Additive risk of serotonin syndrome",
    ],
    unsafe: [
      "Tramadol - Increased risk of seizures and serotonin syndrome",
      "St. John's wort - Increased serotonergic effects and serotonin syndrome risk",
      "Linezolid / methylene blue - Reversible MAO inhibition; serotonin syndrome risk",
      "Tamoxifen - Paroxetine strongly inhibits CYP2D6, reducing conversion to active endoxifen and decreasing tamoxifen efficacy",
    ],
    uncertain: [
      "NSAIDs and aspirin - Increased bleeding risk via platelet effects",
      "CYP2D6 substrates (e.g., atomoxetine, TCAs) - Paroxetine potently inhibits CYP2D6",
      "Alcohol - Additive CNS effects; may worsen depression",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Paroxetine must be taken daily for 2 to 6 weeks before full therapeutic effects are felt; it is not effective for acute symptom relief.",
    "Do not stop abruptly under any circumstances; paroxetine has one of the most severe discontinuation syndromes among SSRIs and must be tapered slowly over weeks to months.",
    "Do not combine with MAOIs; allow at least 14 days between stopping an MAOI and starting paroxetine (and vice versa) to avoid serotonin syndrome.",
    "Be alert for signs of serotonin syndrome (agitation, sweating, tremor, hyperthermia, clonus) when combined with other serotonergic drugs.",
    "Avoid use with tamoxifen in breast cancer patients; paroxetine inhibits CYP2D6 and reduces tamoxifen's activation.",
    "Watch for emerging or worsening suicidal ideation, particularly in children, adolescents, and young adults during the first weeks of therapy.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C19H20FNO3",
    molecularWeight: "374.4 g/mol",
    class: "SSRI",
  },
  history:
    "Paroxetine was developed by the Danish pharmaceutical company Ferrosan and later acquired by SmithKline Beecham (now GlaxoSmithKline). It was approved by the US FDA in 1992 and marketed as Paxil (Seroxat in Europe). At launch it was promoted as more effective than earlier SSRIs for severe depression and anxiety, but post-marketing experience and litigation around its discontinuation syndrome and suicidality signal in adolescents significantly affected its prescribing.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "low",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Paroxetine",
};
