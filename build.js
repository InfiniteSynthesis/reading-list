/**
 * @prettier
 */

const fs = require('fs');
const path = require('path');

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

	let urlAndBib = '';
	for (key in entry.url) {
		urlAndBib += `<a href="${entry.url[key]}" target="_blank" rel="noopener noreferrer">${key}</a>`;
	}

	for (key in entry.bibtex) {
		const bibFile = entry.bibtex[key].replaceAll('/', '_');
		urlAndBib += `<a href="bib/${bibFile}.bib" target="_blank" rel="noopener noreferrer" title="${key}">.BIB</a>`;
	}
	urlAndBib = urlAndBib.replaceAll('</a><a', '</a> | <a');

	entryMarkdown += `<tr>
	<td><i>${authors}</i></td>
	<td min-width="150" align="center">${entry.booktitle}</td>
	<td min-width="150" align="center">${urlAndBib}</td>
</tr>
`;

	return entryMarkdown;
};

const sections = fs.readdirSync('./content').filter((file) => path.extname(file) === '.json');

sections.forEach((section) => {
	const fileData = fs.readFileSync(path.join('./content', section));
	const data = JSON.parse(fileData.toString());
	const sectionName = section.slice(5, -5).replaceAll('_', ' ');
	content += `## ${sectionName}\n\n`;

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
			.replace('<!-- DETAILS SUMMARY>', sectionName);

		content += sectionCollpaseMarkdown;
	}

	content += `<br />\n\n`;
});

fs.readFile('./template.md', (err, templateBuffer) => {
	if (err) throw err;

	let template = templateBuffer.toString();
	template = template.replace('<!-- content>', content);
	fs.writeFile('./README.md', template, (err) => {
		if (err) console.error(err);
		// file written successfully
	});
});
