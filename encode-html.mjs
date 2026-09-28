/**
 * Standalone encoder — same logic as plugin-jscrewit in `ma hoa html.mjs`.
 * Usage: node encode-html.mjs [input.html] [output.html]
 */
import fs from 'fs/promises';
import JScrewIt from 'jscrewit';
import path from 'path';

const convertString2Unicode = (s) =>
    s
        .split('')
        .map((char) => {
            const hexVal = char.charCodeAt(0).toString(16);
            return '\\u' + ('000' + hexVal).slice(-4);
        })
        .join('');

const encodeHtmlFile = async (inputPath, outputPath) => {
    const data = await fs.readFile(inputPath, 'utf8');
    const TMPL = `document.write('__UNI__')`;
    const jsString = TMPL.replace(/__UNI__/, convertString2Unicode(data));
    const jsfuckCode = JScrewIt.encode(jsString);
    const finalContent = `<script type="text/javascript">${jsfuckCode}</script>`;
    await fs.writeFile(outputPath, finalContent);
    console.log(`encoded: ${path.resolve(inputPath)} -> ${path.resolve(outputPath)}`);
};

const input = process.argv[2] ?? 'index.source.html';
const output = process.argv[3] ?? 'index.html';

await encodeHtmlFile(input, output);
