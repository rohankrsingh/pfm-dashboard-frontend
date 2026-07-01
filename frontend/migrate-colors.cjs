const fs = require('fs');
const path = require('path');

const replacements = [
  // Borders
  { pattern: /border-wise-ink\/5/g, replacement: 'border-border/50' },
  { pattern: /border-wise-ink\/15/g, replacement: 'border-border' },
  { pattern: /border-wise-ink\/20/g, replacement: 'border-border' },
  { pattern: /border-wise-ink\/\[0\.04\]/g, replacement: 'border-border' },
  { pattern: /border-wise-ink/g, replacement: 'border-border' },
  // Success / Positive
  { pattern: /text-wise-positive/g, replacement: 'text-success' },
  { pattern: /bg-wise-positive/g, replacement: 'bg-success' },
  // Hover states
  { pattern: /hover:bg-wise-ink\/10/g, replacement: 'hover:bg-accent' },
  { pattern: /hover:bg-wise-ink/g, replacement: 'hover:bg-primary/90' },
  // Remaining texts/bgs
  { pattern: /text-wise-ink/g, replacement: 'text-foreground' },
  { pattern: /bg-wise-ink/g, replacement: 'bg-primary' },
  { pattern: /border-wise-green/g, replacement: 'border-primary' },
  { pattern: /bg-primary-pale\/30/g, replacement: 'bg-primary/10' },
  { pattern: /bg-primary-pale\/40/g, replacement: 'bg-primary/20' },
  { pattern: /bg-primary-pale/g, replacement: 'bg-primary/20' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { pattern, replacement } of replacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Modified: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
