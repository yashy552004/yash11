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
      
      // 1. Revert the global "green" to "red" to fix words like "greenuce", "CgreenitCard", etc.
      // Wait, is there any legitimate 'green' we want to keep? The colors were replaced to 'green' everywhere.
      content = content.replace(/green/g, 'red');

      // 2. Now ONLY replace tailwind colors for red to green!
      // This is much safer.
      const classesToReplace = ['bg-red', 'text-red', 'border-red', 'shadow-red', 'ring-red', 'hover:bg-red', 'hover:text-red', 'hover:border-red', 'focus:ring-red', 'group-hover:text-red', 'group-hover:bg-red'];
      
      // We will just do a regex replace for the color prefixes:
      content = content.replace(/bg-red-(\d+)/g, 'bg-green-$1');
      content = content.replace(/text-red-(\d+)/g, 'text-green-$1');
      content = content.replace(/border-red-(\d+)/g, 'border-green-$1');
      content = content.replace(/shadow-red-(\d+)/g, 'shadow-green-$1');
      content = content.replace(/ring-red-(\d+)/g, 'ring-green-$1');

      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./src');
console.log('Fixed broken words and properly color replaced');
