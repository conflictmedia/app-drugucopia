import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SEARXNG_URL = 'http://localhost:8080/search';
const ENGINES = 'duckduckgo,brave,google,bing,startpage,wikipedia,pubmed,google_scholar';

async function searchLegality(name: string): Promise<string[]> {
  const queries = [
    `${name} legal status DEA schedule controlled substance`,
    `${name} legal status UN convention schedule controlled substance`,
    `${name} legal status UK Misuse of Drugs Act class`,
    `${name} legal status EU regulation controlled substance`,
    `${name} legal status Canada CDSA schedule`,
    `${name} legal status Australia Poisons Standard schedule`,
    `${name} legality legal status controlled substance schedule`,
  ];

  const results: string[] = [];
  
  for (const query of queries) {
    try {
      const url = `${SEARXNG_URL}?q=${encodeURIComponent(query)}&format=json&engines=${ENGINES}&safesearch=0`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const snippets = data.results?.slice(0, 5).map((r: any) => r.content || r.snippet || '').join(' ') || '';
      if (snippets) results.push(snippets);
    } catch {
      // ignore errors
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

function synthesizeLegality(name: string, snippets: string[]): string {
  const text = snippets.join(' ').toLowerCase();
  
  // Check for specific schedule mentions
  const usSchedule = text.match(/schedule\s*[ivx]+/gi) || [];
  const ukClass = text.match(/class\s*[a-c]/gi) || [];
  const unSchedule = text.match(/un.*schedule\s*[ivx]+/gi) || [];
  const caSchedule = text.match(/canada.*schedule\s*[ivx]+|cdsa.*schedule\s*[ivx]+/gi) || [];
  const auSchedule = text.match(/australia.*schedule\s*\d+|poisons?.*schedule\s*\d+/gi) || [];
  const euControlled = text.match(/eu.*controlled|european.*controlled|ema.*controlled/gi) || [];
  
  const findings: string[] = [];
  
  // US
  if (usSchedule.some(s => /schedule\s*i\b/i.test(s))) findings.push('Schedule I (US)');
  else if (usSchedule.some(s => /schedule\s*ii\b/i.test(s))) findings.push('Schedule II (US)');
  else if (usSchedule.some(s => /schedule\s*iii\b/i.test(s))) findings.push('Schedule III (US)');
  else if (usSchedule.some(s => /schedule\s*iv\b/i.test(s))) findings.push('Schedule IV (US)');
  else if (usSchedule.some(s => /schedule\s*v\b/i.test(s))) findings.push('Schedule V (US)');
  else if (/\bnot.*controlled\b/i.test(text) || /\buncontrolled\b/i.test(text) || /\bnot.*scheduled\b/i.test(text)) findings.push('Unscheduled (US)');
  
  // UK
  if (ukClass.some(c => /class\s*a\b/i.test(c))) findings.push('Class A (UK)');
  else if (ukClass.some(c => /class\s*b\b/i.test(c))) findings.push('Class B (UK)');
  else if (ukClass.some(c => /class\s*c\b/i.test(c))) findings.push('Class C (UK)');
  else if (/\bpsychoactive.*substances.*act\b/i.test(text)) findings.push('Psychoactive Substances Act (UK)');
  
  // UN
  if (unSchedule.some(s => /schedule\s*i\b/i.test(s))) findings.push('Schedule I (UN)');
  else if (unSchedule.some(s => /schedule\s*ii\b/i.test(s))) findings.push('Schedule II (UN)');
  else if (unSchedule.some(s => /schedule\s*iii\b/i.test(s))) findings.push('Schedule III (UN)');
  else if (unSchedule.some(s => /schedule\s*iv\b/i.test(s))) findings.push('Schedule IV (UN)');
  
  // Canada
  if (caSchedule.length > 0) findings.push('Controlled (CA)');
  else if (/\buncontrolled\b/i.test(text) && /\bcanada\b/i.test(text)) findings.push('Uncontrolled (CA)');
  
  // Australia
  if (auSchedule.length > 0) findings.push('Controlled (AU)');
  else if (/\buncontrolled\b/i.test(text) && /\baustralia\b/i.test(text)) findings.push('Uncontrolled (AU)');
  
  // EU
  if (euControlled.length > 0) findings.push('Controlled (EU)');
  else if (/\bprescription.*only\b/i.test(text) && /\beu\b/i.test(text)) findings.push('Prescription-only (EU)');
  
  // Determine overall classification
  const hasControlled = findings.some(f => /schedule\s*[ivx]+|class\s*[a-c]|controlled/i.test(f));
  const hasPrescription = findings.some(f => /prescription/i.test(f));
  const hasUnscheduled = findings.some(f => /unscheduled|uncontrolled/i.test(f));
  
  let prefix = '';
  if (hasControlled && !hasPrescription && !hasUnscheduled) {
    prefix = 'Controlled substance: ';
  } else if (hasPrescription && !hasControlled) {
    prefix = 'Prescription only: ';
  } else if (hasUnscheduled && !hasControlled && !hasPrescription) {
    return 'Unscheduled/Uncontrolled in most jurisdictions';
  } else if (findings.length === 0) {
    return 'Legal status varies by jurisdiction. Check local laws.';
  } else {
    prefix = 'Legal status varies by jurisdiction. ';
  }
  
  return prefix + findings.join(', ');
}

async function main() {
  const substancesDir = '/home/conflift/Projects/substances';
  const categories = readdirSync(substancesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name);

  const allResults: any[] = [];
  
  for (const cat of categories) {
    const catDir = join(substancesDir, cat);
    const files = readdirSync(catDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
    
    for (const file of files) {
      const content = readFileSync(join(catDir, file), 'utf-8');
      const nameMatch = content.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        const id = file.replace('.ts', '');
        console.log(`Searching: ${name} (${id})...`);
        
        const snippets = await searchLegality(name);
        const legality = synthesizeLegality(name, snippets);
        
        allResults.push({ id, name, legality, rawResultCount: snippets.length });
        console.log(`  -> ${legality}`);
      }
    }
  }
  
  writeFileSync('legality-results.json', JSON.stringify(allResults, null, 2));
  console.log(`\nSaved ${allResults.length} results`);
}

main();