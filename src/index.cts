#!/usr/bin/env node
import { AssToMs, clone, convertSRTTags, msToAss } from './utils.cjs';
import stringify from 'ass-stringify';
import * as ass from './assTemplate.cjs';
import * as fs from 'fs/promises';

function generateASSLine(line: any, styles: any) {
	let startMs = +line.startTime - 1000;
	if (startMs < 0) startMs = 0;
	const stopMs = +line.endTime + 100;	
	const dialogue = clone(ass.dialogue);
	const comment = clone(ass.dialogue);
	dialogue.value.Start = comment.value.Start = msToAss(startMs);
	dialogue.value.End = comment.value.End = msToAss(stopMs);
	dialogue.value.Text = ass.dialogueScript + line.text;
	dialogue.value.Effect = 'karaoke';
	dialogue.value.Style = styles.body[1].value.Name;
	comment.value.Text = ass.commentScript + line.text;
	comment.value.Effect = 'fx';
	comment.key = 'Comment';
	comment.value.Style = styles.body[1].value.Name;
	return {
		dialogue,
		comment
	};
}

function sortStartTime(a: any, b: any) {
	if (a.value.Start < b.value.Start) return -1;
	if (a.value.Start > b.value.Start) return 1;
	return 0;
}

/** Parse SRT into something actually usable. Also replaces SRT tags by ASS tags */
export function parseSRT(srt: string): {startTime: string, endTime: string, text: string}[] {
	const rawArr = srt.replaceAll('\r', '').split('\n');
	const ass = [];
	let subSegment = {
		startTime: 0,
		endTime: 0,
		text: ''
	};
	let insideSubSegment = false;
	let sub = [];
	for (const line of rawArr) {
		console.log(line);
		// First line should always be a number.
		if (+line > 0 && !insideSubSegment) {
			insideSubSegment = true;
			continue;
		}
		if (line.match(/\d+:\d\d:\d\d,\d\d\d --> \d+:\d\d:\d\d,\d\d\d/)) {			
			const startTime = line.split(' --> ')[0].replaceAll(',','.');
			const endTime = line.split(' --> ')[1].replaceAll(',','.');
			// Let's convert those to miliseconds because we'll need to add the 1s delay so lines appear a little earlier than expected.
			subSegment.startTime = AssToMs(startTime);
			subSegment.endTime = AssToMs(endTime);
			continue;			
		}
		if (line === '') {			
			// Sub segment is done
			subSegment.text = sub.join('\N');
			ass.push(subSegment);
			subSegment = {
				startTime: 0,
				endTime: 0,
				text: ''
			};
			insideSubSegment = false;
			sub = [];
			continue;
		}
		// Last possibility is that this contains text. So we're adding it.		
		sub.push(convertSRTTags(line)
		);
	}
	if (insideSubSegment) {
		subSegment.text = sub.join('\N');
		ass.push(subSegment);
	}
	return ass;
}

/** Convert SRT data (text) to ASS */
export function convertToASS(text: string): string {
	const sub = parseSRT(text);
	const dialogues = [];
	const comments = [];
	const styles = clone(ass.styles);	
	const script = clone(ass.dialogue);
	script.value.Effect = ass.scriptFX;
	script.value.Text = ass.script;
	script.key = 'Comment';
	comments.push(script);
	for (const line of sub) {
		const ASSLines = generateASSLine(line, styles);
		comments.push(clone(ASSLines.comment));
		dialogues.push(clone(ASSLines.dialogue));
	}	
	comments.sort(sortStartTime);
	dialogues.sort(sortStartTime);
	const events = clone(ass.events);
	events.body = events.body.concat(comments, dialogues);
	return stringify([ass.scriptInfo, styles, events]);
}

async function mainCLI() {
	if (!process.argv[2]) {
		throw `srt2ass - Convert SRT to ASS file
		Usage: srt2ass myfile.srt
		Output goes to stdout
		`;
	}
	const txtFile = process.argv[2];
	if (!await fs.stat(txtFile)) throw `File ${txtFile} does not exist`;
	const txt = await fs.readFile(txtFile, 'utf8');
	return convertToASS(txt);
}

if (require.main === module) mainCLI()
	.then(data => console.log(data))
	.catch(err => console.log(err));
