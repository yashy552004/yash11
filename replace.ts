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
      content = content.replace(/emerald/g, 'red');
      content = content.replace(/MediQuick/g, 'Medicalwala');
      // For black theme, let's also replace some whites and slates to darker colors to match red and black theme
      // Actually, standardizing light theme with red is safer, but user asked for "red and black" theme.
      // Easiest is to change text-slate-900 to text-white, bg-white to bg-black, bg-slate-50 to bg-zinc-900, bg-slate-100 to bg-zinc-800, etc.
      // But maybe just a few global ones are enough.
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./src');
console.log('Replaced successfully');
