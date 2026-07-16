import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface PubChemData {
  CID: number;
  MolecularFormula: string;
  MolecularWeight: string;
}

interface LegalityData {
  id: string;
  name: string;
  legality: string;
  rawResultCount: number;
  curated: boolean;
}

const pubchemData: Record<string, PubChemData> = JSON.parse(readFileSync('pubchem-results.json', 'utf-8'));
const legalityDataArray: LegalityData[] = JSON.parse(readFileSync('legality-results.json', 'utf-8'));

const legalityData: Record<string, string> = {};
for (const entry of legalityDataArray) {
  legalityData[entry.id] = entry.legality;
}

function updateSubstanceFile(filePath: string, id: string): boolean {
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;

  // Update formula
  if (pubchemData[id] && content.includes('"formula": "Unknown"')) {
    content = content.replace(
      /"formula":\s*"Unknown"/,
      `"formula": "${pubchemData[id].MolecularFormula}"`
    );
    changed = true;
  }

  // Update molecularWeight
  if (pubchemData[id] && content.includes('"molecularWeight": "Unknown"')) {
    const mw = parseFloat(pubchemData[id].MolecularWeight).toFixed(2);
    content = content.replace(
      /"molecularWeight":\s*"Unknown"/,
      `"molecularWeight": "${mw} g/mol"`
    );
    changed = true;
  }

  // Update legality - exact match
  if (legalityData[id] && content.includes('"legality": "Legal status varies by jurisdiction. Check local laws."')) {
    const escapedLegality = legalityData[id].replace(/"/g, '\\"');
    content = content.replace(
      /"legality":\s*"Legal status varies by jurisdiction\. Check local laws\."/,
      `"legality": "${escapedLegality}"`
    );
    changed = true;
  }
  
  // Update legality - partial match (already has some data but starts with generic text)
  if (legalityData[id] && content.includes('"legality": "Legal status varies by jurisdiction. Check local laws.')) {
    const escaped = legalityData[id].replace(/"/g, '\\"');
    content = content.replace(
      /"legality":\s*"Legal status varies by jurisdiction\. Check local laws\.[^"]*"/,
      `"legality": "${escaped}"`
    );
    changed = true;
  }

  if (changed) {
    writeFileSync(filePath, content);
    console.log(`Updated: ${id}`);
  }
  return changed;
}

async function main() {
  const substancesDir = '/home/conflift/Projects/substances';
  const categories = readdirSync(substancesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name);

  let totalUpdated = 0;
  let formulaUpdated = 0;
  let molecularWeightUpdated = 0;
  let legalityUpdated = 0;

  for (const cat of categories) {
    const catDir = join(substancesDir, cat);
    const files = readdirSync(catDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
    
    for (const file of files) {
      const id = file.replace('.ts', '');
      const filePath = join(catDir, file);
      const contentBefore = readFileSync(filePath, 'utf-8');
      
      const formulaBefore = contentBefore.includes('"formula": "Unknown"');
      const mwBefore = contentBefore.includes('"molecularWeight": "Unknown"');
      const legalityBefore = contentBefore.includes('"legality": "Legal status varies by jurisdiction. Check local laws."');
      
      if (updateSubstanceFile(filePath, id)) {
        totalUpdated++;
        
        const contentAfter = readFileSync(filePath, 'utf-8');
        if (formulaBefore && !contentAfter.includes('"formula": "Unknown"')) formulaUpdated++;
        if (mwBefore && !contentAfter.includes('"molecularWeight": "Unknown"')) molecularWeightUpdated++;
        if (legalityBefore && !contentAfter.includes('"legality": "Legal status varies by jurisdiction. Check local laws."')) legalityUpdated++;
      }
    }
  }

  console.log(`\nTotal files updated: ${totalUpdated}`);
  console.log(`Formula updated: ${formulaUpdated}`);
  console.log(`Molecular weight updated: ${molecularWeightUpdated}`);
  console.log(`Legality updated: ${legalityUpdated}`);
}

main();