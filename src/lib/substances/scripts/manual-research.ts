import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const manualData: Record<string, { formula?: string; molecularWeight?: string; legality?: string }> = {
  // Plant/fungal mixtures - variable composition
  "cannabis": { 
    formula: "Variable (plant mixture)", 
    molecularWeight: "N/A (plant mixture)",
    legality: "Controlled substance: Schedule I (US), Class B (UK), Controlled (EU/CA/AU); legal/decriminalized in some jurisdictions"
  },
  "datura": { 
    formula: "Variable (plant mixture)", 
    molecularWeight: "N/A (plant mixture)",
    legality: "Legal/Uncontrolled in most jurisdictions (plant parts); some jurisdictions regulate atropine/scopolamine content"
  },
  "ayahuasca": { 
    formula: "Variable (plant mixture: Banisteriopsis caapi + Psychotria viridis)", 
    molecularWeight: "N/A (plant mixture)",
    legality: "Controlled substance: Schedule I (US, UN); religious exemptions in some countries (US, Brazil, Netherlands); illegal in UK, France, Canada"
  },
  "psilocybin-mushrooms": { 
    formula: "Variable (fungal mixture: psilocybin/psilocin + other compounds)", 
    molecularWeight: "N/A (fungal mixture)",
    legality: "Controlled substance: Schedule I (US, UN); decriminalized/legal in some jurisdictions (OR, CO, Jamaica, Brazil, Netherlands truffles); illegal in UK, Canada, Australia"
  },
  "blue-lotus": { 
    formula: "Variable (plant mixture: Nymphaea caerulea)", 
    molecularWeight: "N/A (plant mixture)",
    legality: "Unscheduled/Uncontrolled in most jurisdictions (some countries restrict)"
  },
  "kratom": { 
    formula: "Variable (plant mixture: Mitragyna speciosa - mitragynine, 7-hydroxymitragynine + other alkaloids)", 
    molecularWeight: "N/A (plant mixture)",
    legality: "Legal status varies by jurisdiction. (US: not federally scheduled, banned in 6 states; UK: Psychoactive Substances Act; EU: varies by country; CA: uncontrolled; AU: Schedule 9; banned in Thailand, Malaysia, Myanmar, Denmark, Poland, Sweden, Romania)"
  },
  
  // Known compounds with PubChem data (search by synonym/IUPAC)
  "nitrous": { 
    formula: "N2O", 
    molecularWeight: "44.01 g/mol",
    legality: "Legal/Uncontrolled in most jurisdictions (medical/industrial use); regulated as inhalant abuse in some regions"
  },
  "pcp": { 
    formula: "C17H25N", 
    molecularWeight: "243.39 g/mol",
    legality: "Controlled substance: Schedule II (US), Class A (UK), Schedule II (UN), Controlled (EU/CA/AU)"
  },
  "pma": { 
    formula: "C10H15NO2", 
    molecularWeight: "179.23 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Schedule I (UN), Controlled (EU/CA/AU)"
  },
  "pmma": { 
    formula: "C11H17NO2", 
    molecularWeight: "193.26 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Schedule I (UN), Controlled (EU/CA/AU)"
  },
  "mt": { 
    formula: "C11H14N2", 
    molecularWeight: "174.24 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Schedule I (UN), Controlled (EU/CA/AU)"
  },
  "det": { 
    formula: "C14H20N2", 
    molecularWeight: "216.32 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Schedule I (UN), Controlled (EU/CA/AU)"
  },
  "dpt": { 
    formula: "C16H24N2", 
    molecularWeight: "244.37 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Schedule I (UN), Controlled (EU/CA/AU)"
  },
  "ept": { 
    formula: "C14H20N2", 
    molecularWeight: "216.32 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Schedule I (UN), Controlled (EU/CA/AU)"
  },
  "mpt": { 
    formula: "C14H20N2", 
    molecularWeight: "216.32 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Schedule I (UN), Controlled (EU/CA/AU)"
  },
  "k-2c-b": { 
    formula: "C18H22BrNO3", 
    molecularWeight: "372.28 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Controlled (EU/CA/AU)"
  },
  "alpha-gpc": { 
    formula: "C8H20NO6P", 
    molecularWeight: "257.22 g/mol",
    legality: "Unscheduled/Uncontrolled in most jurisdictions (dietary supplement)"
  },
  "mephenaqualone": { 
    formula: "C16H14N2O", 
    molecularWeight: "250.29 g/mol",
    legality: "Controlled substance: Schedule I (US), Class B (UK), Controlled (EU/CA/AU)"
  },
  "f-phenibut": { 
    formula: "C10H12FNO2", 
    molecularWeight: "197.21 g/mol",
    legality: "Legal status varies: US: uncontrolled (research chemical); UK: Psychoactive Substances Act; EU: varies; CA: uncontrolled; AU: Schedule 4"
  },
  "hxe": { 
    formula: "C14H19NO", 
    molecularWeight: "217.31 g/mol",
    legality: "Legal status varies: US: uncontrolled; UK: Psychoactive Substances Act; EU: varies; CA: uncontrolled; AU: likely Schedule 9"
  },
  "mxipr": { 
    formula: "C17H25NO", 
    molecularWeight: "259.39 g/mol",
    legality: "Legal status varies: US: uncontrolled; UK: Psychoactive Substances Act; EU: varies; CA: uncontrolled; AU: likely Schedule 9"
  },
  "n-methylbisfluoromodafinil": { 
    formula: "C17H13F2N3O2S", 
    molecularWeight: "363.37 g/mol",
    legality: "Legal status varies: US: uncontrolled (modafinil analog); UK: Psychoactive Substances Act; EU: varies; CA: uncontrolled; AU: likely Schedule 4"
  },
  "4f-eph": { 
    formula: "C13H18FNO", 
    molecularWeight: "221.29 g/mol",
    legality: "Legal status varies: US: uncontrolled; UK: Psychoactive Substances Act; EU: varies; CA: uncontrolled; AU: likely Schedule 9"
  },
  "a-php": { 
    formula: "C16H23NO", 
    molecularWeight: "245.36 g/mol",
    legality: "Controlled substance: Schedule I (US), Class B (UK), Controlled (EU/CA/AU)"
  },
  "2c-c": { 
    formula: "C10H14ClNO2", 
    molecularWeight: "215.67 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Controlled (EU/CA/AU)"
  },
  "lsm-775": { 
    formula: "C20H23N3O2", 
    molecularWeight: "337.41 g/mol",
    legality: "Controlled substance: Schedule I (US), Class A (UK), Controlled (EU/CA/AU)"
  },
  "nm-2-ai": { 
    formula: "C10H13N", 
    molecularWeight: "147.22 g/mol",
    legality: "Legal status varies: US: uncontrolled; UK: Psychoactive Substances Act; EU: varies; CA: uncontrolled; AU: likely Schedule 9"
  },
  "phenibut": { 
    formula: "C10H13NO2", 
    molecularWeight: "179.22 g/mol",
    legality: "Legal status varies by jurisdiction. (US: uncontrolled federally, scheduled in some states (AL, AR, IN, LA, MI, TN); UK: controlled under Psychoactive Substances Act 2016; EU: varies, controlled in some member states (FR, DE, HU, LV); CA: uncontrolled; AU: Schedule 4 (prescription only))"
  },
};

async function main() {
  const substancesDir = '/home/conflift/Projects/substances';
  const categories = readdirSync(substancesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name);

  let updated = 0;

  for (const cat of categories) {
    const catDir = join(substancesDir, cat);
    const files = readdirSync(catDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
    
    for (const file of files) {
      const id = file.replace('.ts', '');
      if (manualData[id]) {
        const filePath = join(catDir, file);
        let content = readFileSync(filePath, 'utf-8');
        let changed = false;
        const data = manualData[id];

        // Update formula
        if (data.formula && content.includes('"formula": "Unknown"')) {
          content = content.replace(
            /"formula":\s*"Unknown"/,
            `"formula": "${data.formula}"`
          );
          changed = true;
        }

        // Update molecularWeight
        if (data.molecularWeight && content.includes('"molecularWeight": "Unknown"')) {
          content = content.replace(
            /"molecularWeight":\s*"Unknown"/,
            `"molecularWeight": "${data.molecularWeight}"`
          );
          changed = true;
        }

        // Update legality - exact match
        if (data.legality && content.includes('"legality": "Legal status varies by jurisdiction. Check local laws."')) {
          const escaped = data.legality.replace(/"/g, '\\"');
          content = content.replace(
            /"legality":\s*"Legal status varies by jurisdiction\. Check local laws\."/,
            `"legality": "${escaped}"`
          );
          changed = true;
        }
        
        // Update legality - partial match (already has some data but starts with generic text)
        if (data.legality && content.includes('"legality": "Legal status varies by jurisdiction. Check local laws.')) {
          const escaped = data.legality.replace(/"/g, '\\"');
          content = content.replace(
            /"legality":\s*"Legal status varies by jurisdiction\. Check local laws\.[^"]*"/,
            `"legality": "${escaped}"`
          );
          changed = true;
        }

        if (changed) {
          writeFileSync(filePath, content);
          console.log(`Updated: ${id} (${cat})`);
          updated++;
        }
      }
    }
  }

  console.log(`\nTotal files updated: ${updated}`);
}

main();