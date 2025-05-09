import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert `__dirname` for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the component name from the arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error('❌ Please provide a component name, e.g., `new-comp SomeComp`.');
  process.exit(1);
}

// Paths
const componentsDir = path.join(__dirname, '..', 'src', 'components');
const componentDir = path.join(componentsDir, componentName);
const tsxFilePath = path.join(componentDir, `${componentName}.tsx`);
const cssFilePath = path.join(componentDir, `${componentName}.module.css`);

// Templates
const tsxTemplate = `import styles from './${componentName}.module.css';

export default function ${componentName}() {
  return (
    <div className={styles.container}>
      <h1>${componentName}</h1>
    </div>
  );
}
`;

const cssTemplate = `.container {
  /* Add styles for ${componentName} here */
}
`;

// Create the folder and files
if (fs.existsSync(componentDir)) {
  console.error(`❌ Component "${componentName}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(componentDir, { recursive: true });
fs.writeFileSync(tsxFilePath, tsxTemplate);
fs.writeFileSync(cssFilePath, cssTemplate);

console.log(`✅ Component "${componentName}" created successfully at src/components/${componentName}`);