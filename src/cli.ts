#!/usr/bin/env node
import * as fs from 'fs/promises';
import { convertToASS } from './index.js';

async function mainCLI() {
	if (!process.argv[2]) {
		throw `convert-srt-to-ass - Convert SRT to ASS file
		Usage: convert-srt-to-ass myfile.srt
		Output goes to stdout
		`;
	}
	const txtFile = process.argv[2];
	if (!await fs.stat(txtFile)) throw `File ${txtFile} does not exist`;
	const txt = await fs.readFile(txtFile, 'utf8');
	return convertToASS(txt);
}

mainCLI()
	.then(data => console.log(data))
	.catch(err => console.log(err));
