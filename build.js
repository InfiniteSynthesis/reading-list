/**
 * @prettier
 */

const fs = require('fs');

const json = require('./content.json');

const sectionMarkdownTemplate = `<table>
<!-- SECTION CONTENT>
</table>

`;

const collapseMarkdownTemplate = `<details>
<summary>More on <!-- DETAILS SUMMARY></summary>
<table>
<!-- DETAILS CONTENT>
</table>
</details>

`;

let content = '';

const solveEntry = (entry) => {
	let entryMarkdown = '';
	entryMarkdown += `<tr><td colspan="3"><strong>${entry.title}</strong></td></tr>\n`;

	const authors = entry.author.replaceAll(' and', ',');
	const bibAddr = entry.bibtex? entry.bibtex[0].replaceAll('/', '_') : undefined;
	const bibItem = bibAddr ? ` | <a href="bib/${bibAddr}.bib">.BIB</a>` : '';
	entryMarkdown += `\t<tr>
    \t<td><i>${authors}</i></td>
    \t<td width="175" align="center">${entry.booktitle}</td>
    \t<td width="100" align="center"><a href="${entry.url}">PDF</a>${bibItem}</td>
    </tr>\n`;

	return entryMarkdown;
};

for (key in json) {
	content += `## ${key}\n\n`;

	const data = json[key];

	let sectionMarkdown = sectionMarkdownTemplate;
	let sectionCollpaseMarkdown = collapseMarkdownTemplate;

	data.forEach((entry) => {
		const markdown = solveEntry(entry);
		if (entry.detail) {
			sectionCollpaseMarkdown = sectionCollpaseMarkdown.replace(
				'<!-- DETAILS CONTENT>',
				`${markdown}<!-- DETAILS CONTENT>`
			);
		} else {
			sectionMarkdown = sectionMarkdown.replace('<!-- SECTION CONTENT>', `${markdown}<!-- SECTION CONTENT>`);
		}
	});

	sectionMarkdown = sectionMarkdown.replace('<!-- SECTION CONTENT>\n', '');
	content += sectionMarkdown;

	if (sectionCollpaseMarkdown !== collapseMarkdownTemplate) {
		sectionCollpaseMarkdown = sectionCollpaseMarkdown
			.replace('<!-- DETAILS CONTENT>\n', '')
			.replace('<!-- DETAILS SUMMARY>', key);

		content += sectionCollpaseMarkdown;
	}

	content += `<br />\n\n`
}

fs.readFile('./template.md', (err, templateBuffer) => {
	if (err) throw err;

	let template = templateBuffer.toString();
	template = template.replace('<!-- content>', content);
	fs.writeFile('./README.md', template, (err) => {
		if (err) {
			console.error(err);
		}
		// file written successfully
	});
});
