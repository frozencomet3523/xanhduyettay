import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';
const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores(['.next/**', 'out/**', 'build/**', '.netlify/**', 'next-env.d.ts', 'capcut-ui-export/**']),
    {
        rules: {}
    }
]);

export default eslintConfig;
