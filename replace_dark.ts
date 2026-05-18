import fs from 'fs';
import path from 'path';

function replaceInDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Light -> Dark mode replacements
      content = content.replace(/bg-slate-50/g, 'bg-black');
      content = content.replace(/bg-white/g, 'bg-zinc-950');
      content = content.replace(/bg-slate-100/g, 'bg-zinc-900');
      content = content.replace(/bg-slate-200/g, 'bg-zinc-800');
      
      content = content.replace(/text-slate-900/g, 'text-white');
      content = content.replace(/text-slate-800/g, 'text-zinc-100');
      content = content.replace(/text-slate-600/g, 'text-zinc-300');
      content = content.replace(/text-slate-500/g, 'text-zinc-400');
      content = content.replace(/text-slate-400/g, 'text-zinc-500');
      
      content = content.replace(/border-slate-200/g, 'border-zinc-800');
      content = content.replace(/border-slate-100/g, 'border-zinc-900');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./src');
console.log('Theme transformed successfully');
