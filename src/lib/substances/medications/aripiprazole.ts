import type { Substance } from "../types";

export const aripiprazole: Substance = {
  id: "aripiprazole",
  name: "Aripiprazole",
  commonNames: ["Aripiprazole", "Abilify", "Abilify Maintena"],
  categories: ["medications"],
  class: "Atypical antipsychotic",
  description:
    "Aripiprazole is a quinolinone atypical antipsychotic distinguished by its mechanism as a partial agonist at dopamine D2 and serotonin 5-HT1A receptors, with antagonism at 5-HT2A receptors, leading to its description as a dopamine system stabilizer. Its partial agonist activity produces functional antagonism in hyperdopaminergic mesolimbic pathways while supporting dopaminergic tone in hypodopaminergic mesocortical pathways. It is indicated for schizophrenia, bipolar I disorder (acute manic and mixed episodes and maintenance), as an adjunct to antidepressants for major depressive disorder, for irritability associated with autistic disorder in pediatric patients, and for Tourette's disorder. Aripiprazole carries a relatively favorable metabolic profile compared with most other atypicals and a low risk of hyperprolactinemia, but akathisia and activation are common, and impulse control disorders (including pathological gambling, hypersexuality, and compulsive spending) have been reported. Aripiprazole has a very long elimination half-life (approximately 75 hours) and is available as a long-acting injectable given monthly or every 6-8 weeks.",
  effects: {
    positive: [
      "Reduced positive symptoms of psychosis",
      "Mood stabilization",
      "Suppression of manic symptoms",
      "Adjunctive antidepressant effect",
      "Lower risk of metabolic effects than most other atypicals",
    ],
    neutral: [
      "Mild akathisia",
      "Mild insomnia or activation",
      "Mild restlessness",
    ],
    negative: [
      "Akathisia",
      "Insomnia and activation",
      "Restlessness",
      "Weight gain (less than olanzapine or quetiapine)",
      "Impulse control disorders (pathological gambling, hypersexuality, compulsive spending)",
      "Nausea and vomiting (especially at initiation)",
    ],
  },
  defaultUnit: "mg",
  routeData: {
    oral: {
      dosage: {
        threshold: "2mg",
        light: "5-10mg",
        common: "10-15mg",
        strong: "15-30mg",
        heavy: "30mg+",
      },
      duration: {
        onset: "1-3 hours",
        comeup: "2-6 hours",
        peak: "6-12 hours",
        offset: "3-7 days (half-life approximately 75 hours)",
        total: "Several days to reach steady state",
        afterglow: "Days to weeks at steady state",
      },
    },
  },
  interactions: {
    dangerous: [
      "QT-prolonging drugs - additive QT prolongation risk (rare with aripiprazole alone but possible in combination)",
      "Alcohol - additive CNS depression",
      "Combination with other antipsychotics - additive EPS, sedation, and metabolic risk",
    ],
    unsafe: [
      "Strong CYP3A4 inducers (carbamazepine, rifampin, phenytoin) - substantially reduce aripiprazole plasma levels, requiring dose increase",
      "CYP2D6 inhibitors (fluoxetine, paroxetine, quinidine) and strong CYP3A4 inhibitors (ketoconazole, clarithromycin) - substantially increase aripiprazole levels, requiring dose reduction",
      "Levodopa and dopamine agonists - aripiprazole's D2 partial agonism may antagonize their therapeutic effects",
    ],
    uncertain: [
      "Warfarin - isolated reports of altered INR",
      "Antihypertensives - possible additive orthostatic hypotension",
    ],
    crossTolerances: [""],
  },
  harmReduction: [
    "Akathisia is the most common tolerability problem with aripiprazole and can be distressing; differentiate from psychotic agitation, consider dose reduction, and treat with beta-blockers, benzodiazepines, or mirtazapine when needed.",
    "Patients and caregivers should be counseled about impulse control disorders (pathological gambling, hypersexuality, compulsive shopping, binge eating). These can occur at any time during treatment; reduce dose or discontinue if they emerge.",
    "Aripiprazole has a long half-life (approximately 75 hours, longer for the metabolite dehydro-aripiprazole). Full steady-state effects and adverse effects may take 2 weeks or longer to manifest after dose changes; titrate conservatively.",
    "Although aripiprazole is less metabolically burdensome than olanzapine or quetiapine, monitor weight, fasting glucose, and lipids at baseline and periodically during chronic therapy.",
    "Aripiprazole can cause orthostatic hypotension at initiation; rise slowly from sitting or lying positions, especially in elderly patients or those with cardiovascular disease.",
    "Elderly patients with dementia-related psychosis treated with antipsychotics have an increased risk of death; aripiprazole is not approved for this population.",
  ],
  legality: "Prescription medication in most jurisdictions.",
  chemistry: {
    formula: "C23H27Cl2N3O2",
    molecularWeight: "448.39 g/mol",
    class: "Quinolinone atypical antipsychotic (D2 partial agonist)",
  },
  history:
    "Aripiprazole was discovered in 1988 by Otsuka Pharmaceutical and approved by the FDA in 2002 for the treatment of schizophrenia, becoming the first antipsychotic marketed as a dopamine system stabilizer based on its D2 partial agonist mechanism. Subsequent approvals expanded its use to bipolar I disorder, as an adjunct for major depressive disorder, for irritability associated with autism, and for Tourette's disorder, and long-acting injectable formulations were developed for maintenance therapy.",
  afterEffects: "See route data for afterglow information.",
  riskLevel: "moderate",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Aripiprazole",
};
