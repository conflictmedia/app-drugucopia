import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface PubChemCompound {
  CID: number;
  MolecularFormula: string;
  MolecularWeight: string;
}

async function fetchPubChemData(name: string): Promise<PubChemCompound | null> {
  const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight/JSON`;
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) return null;
    const data = await response.json();
    const props = data.PropertyTable?.Properties?.[0];
    if (!props) return null;
    return {
      CID: props.CID,
      MolecularFormula: props.MolecularFormula,
      MolecularWeight: String(props.MolecularWeight),
    };
  } catch {
    return null;
  }
}

async function main() {
  const substancesDir = '/home/conflift/Projects/substances';
  const categories = readdirSync(substancesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name);

  const results: Record<string, PubChemCompound> = {};

  for (const cat of categories) {
    const catDir = join(substancesDir, cat);
    const files = readdirSync(catDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
    
    for (const file of files) {
      const content = readFileSync(join(catDir, file), 'utf-8');
      const nameMatch = content.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        const data = await fetchPubChemData(name);
        if (data) {
          const id = file.replace('.ts', '');
          results[id] = data;
          console.log(`Found: ${name} (${id}) -> ${data.MolecularFormula}, ${data.MolecularWeight}`);
        } else {
          console.log(`Not found: ${name} (${file})`);
        }
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }

  writeFileSync('pubchem-results.json', JSON.stringify(results, null, 2));
  console.log(`Saved ${Object.keys(results).length} results`);
}

main();