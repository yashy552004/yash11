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
      
      // Light -> Dark mode replacements REVERSAL
      content = content.replace(/bg-black/g, 'bg-slate-50');
      content = content.replace(/bg-zinc-950/g, 'bg-white');
      content = content.replace(/bg-zinc-900/g, 'bg-slate-100');
      content = content.replace(/bg-zinc-800/g, 'bg-slate-200');
      
      content = content.replace(/text-zinc-100/g, 'text-slate-800');
      content = content.replace(/text-zinc-300/g, 'text-slate-600');
      content = content.replace(/text-zinc-400/g, 'text-slate-500');
      content = content.replace(/text-zinc-500/g, 'text-slate-400');
      
      content = content.replace(/border-zinc-800/g, 'border-slate-200');
      content = content.replace(/border-zinc-900/g, 'border-slate-100');

      // Now we have to fix text-white which was substituted for text-slate-900
      // Instead of simple replacement, we change all text-white to text-slate-900
      // THEN we fix the ones with bg-red (which will become bg-green) back to text-white.
      content = content.replace(/text-white/g, 'text-slate-900');

      // Change red to green (which was originally emerald)
      content = content.replace(/red/g, 'green');

      // Fix buttons / badge text colors back to white!
      // This regex looks for bg-green-xxx and text-slate-900 in the same className string (very roughly)
      // Actually, we can just replace specific button strings we know exist:
      content = content.replace(/bg-green-600 text-slate-900/g, 'bg-green-600 text-white');
      content = content.replace(/bg-green-500 text-slate-900/g, 'bg-green-500 text-white');
      content = content.replace(/bg-green-700 text-slate-900/g, 'bg-green-700 text-white');
      content = content.replace(/bg-green-900 text-slate-900/g, 'bg-green-900 text-white');
      content = content.replace(/text-slate-900 px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700/g, 'text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700'); // admin dashboard button
      content = content.replace(/text-slate-900 p-4 rounded-full shadow-xl/g, 'text-white p-4 rounded-full shadow-xl');
      content = content.replace(/text-slate-900 px-6 py-2 rounded-full font-medium/g, 'text-white px-6 py-2 rounded-full font-medium');

      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./src');
console.log('Green/White Theme transformed successfully');
