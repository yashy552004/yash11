import fs from 'fs';
import path from 'path';

function fixFile(filePath: string, search: RegExp | string, replace: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content);
}

fixFile('./src/pages/Store.tsx', /hover:bg-green-600 hover:text-slate-900/g, 'hover:bg-green-600 hover:text-white');
fixFile('./src/pages/AdminDashboard.tsx', /text-slate-900 bg-green-600/g, 'text-white bg-green-600');
fixFile('./src/App.tsx', /bg-green-600 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-green-200/g, 'bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200');
fixFile('./src/App.tsx', /bg-green-600 rounded-3xl p-8 md:p-16 text-slate-900 relative/g, 'bg-green-600 rounded-3xl p-8 md:p-16 text-white relative');
fixFile('./src/App.tsx', /bg-green-500 border border-green-400 text-slate-900 px-8 py-3/g, 'bg-green-500 border border-green-400 text-white px-8 py-3');
fixFile('./src/App.tsx', /group-hover:bg-green-600 group-hover:text-slate-900/g, 'group-hover:bg-green-600 group-hover:text-white');

console.log('Fixed broken text colors');
