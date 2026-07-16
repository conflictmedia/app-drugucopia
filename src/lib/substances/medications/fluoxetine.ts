import type { Substance } from "../types";

export const fluoxetine: Substance = {
  id: "fluoxetine",
  name: "Fluoxetine",
  commonNames: ["Fluoxetine", "Prozac", "Sarafem"],
  categories: ["medications"],
  class: "SSRI",
  description:
    "Fluoxetine is a selective serotonin reuptake inhibitor (SSRI) indicated for major depressive disorder, obsessive-compulsive disorder, bulimia nervosa, panic disorder, and premenstrual dysphoric disorder. It acts by potently blocking the presynaptic serotonin transporter and is metabolized to norfluoxetine, an equally active metabolite with an even longer half-life. Therapeutic effects typically emerge 2 to 6 weeks after initiating daily therapy, although the long half-life means steady-state concentrations take a month or more to establish. Its long half-life substantially reduces the risk and severity of discontinuation syndrome compared to other SSRIs, but also prolongs the washout period required before starting an MAOI.",
  effects: {
    positive: [
      "Mood elevation (with chronic use)",
      "Anxiety reduction (with chronic use)",
      "Reduced intrusive thoughts (in OCD)",
      "Decreased binge-purge behaviors (in bulimia)",
      "Activating profile; less sedation than some other SSRIs",
    ],
    neutral: [
      "Delayed onset of therapeutic action (2-6 weeks)",
      "Mild gastrointestinal upset",
      "Increased energy / mild activation",
      "Vivid dreams",
      "Sweating",
    ],
    negative: [
      "Sexual dysfunction (anorgasmia, decreased libido)",
      "Nausea and insomnia (especially early in therapy)",
      "Anxiety or jitteriness during initiation",
      "Weight changes (loss early, gain late)",
      "Risk of serotonin syndrome with serotonergic co-ingestants",
      "Long washout period required before starting an MAOI",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "10mg",
        light: "10-20mg",
        common: "20-40mg",
        strong: "40-80mg",
        heavy: "80mg+",
      },
      duration: {
        onset: "2-4 weeks (therapeutic effects)",
        comeup: "1-2 weeks (initial improvements)",
        peak: "4-8 weeks (full therapeutic effect)",
        offset: "1-4 days (parent half-life); 7-15 days (norfluoxetine metabolite)",
        total: "Months to years (chronic therapy)",
        afterglow: "Long half-life typically blunts discontinuation symptoms",
      },
    },
  },
  interactions: {
    dangerous: [
      "MAOIs (e.g., phenelzine, tranylcypromine, selegiline) - Risk of severe serotonin syndrome; at least 5-week washout required after stopping fluoxetine due to long half-life",
      "Pimozide / thioridazine - Risk of QT prolongation and fatal arrhythmia (CYP2D6 inhibition)",
      "Other SSRIs, SNRIs, and serotonergic agents - Additive risk of serotonin syndrome",
    ],
    unsafe: [
      "Tramadol - Increased risk of seizures and serotonin syndrome",
      "St. John's wort - Increased serotonergic effects and serotonin syndrome risk",
      "Linezolid / methylene blue - Reversible MAO inhibition; serotonin syndrome risk",
      "Drugs metabolized by CYP2D6 (e.g., TCAs, beta-blockers, atomoxetine, certain antipsychotics) - Fluoxetine potently inhibits CYP2D6, raising levels of co-administered substrates",
    ],
    uncertain: [
      "NSAIDs and aspirin - Increased bleeding risk via platelet effects",
      "Alcohol - Additive CNS effects; may worsen depression",
      "Lithium - Possible serotonergic potentiation",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Fluoxetine must be taken daily for 2 to 6 weeks before full therapeutic effects are felt; it is not effective for acute symptom relief.",
    "Do not combine with MAOIs; due to fluoxetine's long half-life and active metabolite, allow at least 5 weeks after stopping fluoxetine before starting an MAOI.",
    "Be alert for signs of serotonin syndrome (agitation, sweating, tremor, hyperthermia, clonus) when combined with other serotonergic drugs.",
    "Fluoxetine is a potent CYP2D6 inhibitor; review all concomitant medications for elevated substrate levels and dose adjustments.",
    "Although its long half-life makes abrupt cessation less problematic than with other SSRIs, tapering is still recommended when clinically feasible.",
    "Watch for emerging or worsening suicidal ideation, particularly in children, adolescents, and young adults during the first weeks of therapy.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C17H18F3NO",
    molecularWeight: "309.3 g/mol",
    class: "SSRI",
  },
  history:
    "Fluoxetine was synthesized in 1972 by Bryan Molloy and David Wong at Eli Lilly, building on the antihistamine diphenhydramine as a structural lead. It was approved by the US FDA in December 1987 and launched under the brand name Prozac in early 1988, becoming the first major SSRI marketed in the United States and ushering in the modern era of antidepressant pharmacotherapy. Its commercial success and cultural impact were unprecedented, and it was later approved for premenstrual dysphoric disorder under the brand name Sarafem.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "low",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Fluoxetine",
};
