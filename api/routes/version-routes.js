const app = require('../api');

const Atom = require('../models').Atom;
const Version = require('../models').Version;
const Promise = require('bluebird');
const Request = require('request-promise');
import {uploadLocalFile} from '../services/aws';
import {generateMarkdownFile, generatePDFFromJSON} from '../services/exporters';


export function saveVersion(req, res) {
	if (!req.user) { return res.status(403).json('Not Logged In'); }

	const userID = req.user._id;
	const now = new Date().getTime();
	const newVersion = req.body.newVersion;

	const version = new Version({
		type: newVersion.type,
		// hash: undefined,
		message: newVersion.message,
		parent: newVersion.parent,
		createdBy: userID,
		createDate: now,
		content: newVersion.content || {},
		isPublished: newVersion.isPublished || false,
	});

	const checkAndSaveJupyter = new Promise(function(resolve) {
		if (newVersion.type === 'jupyter') {
			const query = Request.post('http://jupyter-dd419b35.e87eb116.svc.dockerapp.io/convert', {form: { url: req.body.newVersion.content.url } });
			resolve(query);
		} else {
			resolve();
		}
	});

	checkAndSaveJupyter.then(function(response) {
		if (newVersion.type === 'jupyter') {
			version.content.htmlUrl = response;
		}
		return version.save();
	})
	.then(function(savedVersion) { // Add to atom versions array and return version
		const updateAtom = Atom.update({ _id: newVersion.parent }, { $addToSet: { versions: savedVersion._id}, $set: {lastUpdated: now} }).exec();
		return [savedVersion, updateAtom];
	})
	.spread(function(savedVersion, updatedAtomResult) {
		if (newVersion.type !== 'document') { return [savedVersion, undefined]; }
		return [savedVersion, Atom.findOne({ _id: newVersion.parent }).exec()];
	})
	.spread(function(savedVersion, atomData) {
		if (newVersion.type !== 'document') { return [savedVersion, undefined]; }

		// // If it's a document, save PDF, XML, and Markdown
		// // Execute these promises outside of the main flow. These complete on the fly, even though we return to the original request.
		// const tasks = [
		// 	generateMarkdownFile(savedVersion.content.markdown),
		// 	generatePDFFromJSON(savedVersion.content.docJSON, atomData.title, savedVersion.createDate, 'Jane Doe and Marcus Aurilie'),
		// 	// generateXMLFromJSON(savedVersion.content.docJSON),
		// ];
		// Promise.all(tasks)
		// .then(function(taskResults) {
		// 	if (newVersion.type !== 'document') { return [savedVersion, undefined]; }

		// 	const uploadTasks = [
		// 		uploadLocalFile(taskResults[0]),
		// 		uploadLocalFile(taskResults[1]),
		// 		// uploadLocalFile(taskResults[2]),
		// 	];
		// 	return Promise.all(uploadTasks);
		// })
		// .then(function(taskResults) {
		// 	savedVersion.content.markdownFile = 'https://assets.pubpub.org/' + taskResults[0];
		// 	savedVersion.content.PDFFile = 'https://assets.pubpub.org/' + taskResults[1];
		// 	// savedVersion.content.XMLFile = 'https://assets.pubpub.org/' + taskResults[2];
		// 	const updateVersion = Version.update({ _id: savedVersion._id }, { $set: {
		// 		'content.markdownFile': savedVersion.content.markdownFile,
		// 		'content.PDFFile': savedVersion.content.PDFFile,
		// 	}}).exec();
		// 	return updateVersion;
		// })
		// .then(function(updateResult) {
		// 	// console.log('successfully created files');
		// 	return undefined;
		// })
		// .catch(function(error) {
		// 	console.log('Error generate version files', error);
		// 	return res.status(500).json(error);
		// });


		return savedVersion;
	})
	.then(function(savedVersion) {
		return res.status(201).json(savedVersion);
	})
	.catch(function(error) {
		console.log('error', error);
		return res.status(500).json(error);
	});
}
app.post('/saveVersion', saveVersion);

export function generateMarkdown(req, res) {

	const versionID = req.query.versionID;

	Version.findOne({_id: versionID}).exec()
	.then(function(version) {
		if (!version) { throw new Error('Version does not exist'); }
		return generateMarkdownFile(version.content.markdown);
	})
	.then(function(markdownFile) {
		return uploadLocalFile(markdownFile);
	})
	.then(function(fileURL) {
		const markdownFileURL = 'https://assets.pubpub.org/' + fileURL;
		return [markdownFileURL, Version.update({ _id: versionID }, { $set: { 'content.markdownFile': markdownFileURL }}).exec()];
	})
	.spread(function(markdownFileURL, updateResult) {
		return res.status(201).json(markdownFileURL);
	})
	.catch(function(error) {
		console.log('Error generating Markdown file. ', error);
		return res.status(500).json(error);
	});
}
app.get('/generateMarkdown', generateMarkdown);

export function generatePDF(req, res) {

	const versionID = req.query.versionID;

	Version.findOne({_id: versionID}).populate('parent').exec()
	.then(function(version) {
		if (!version) { throw new Error('Version does not exist'); }
		return generatePDFFromJSON(version.content.docJSON, version.parent.title, version.createDate, 'Jane Doe and Marcus Aurilie');
	})
	.then(function(pdfFile) {
		return uploadLocalFile(pdfFile);
	})
	.then(function(fileURL) {
		const pdfFileURL = 'https://assets.pubpub.org/' + fileURL;
		return [pdfFileURL, Version.update({ _id: versionID }, { $set: { 'content.PDFFile': pdfFileURL }}).exec()];
	})
	.spread(function(pdfFileURL, updateResult) {
		return res.status(201).json(pdfFileURL);
	})
	.catch(function(error) {
		console.log('Error generating Markdown file. ', error);
		return res.status(500).json(error);
	});
}
app.get('/generatePDF', generatePDF);


export function setVersionPublished(req, res) {
	if (!req.user) { return res.status(403).json('Not Logged In'); }

	const userID = req.user._id;
	const now = new Date().getTime();
	const versionID = req.body.versionID;

	Version.findById(versionID).exec()
	.then(function(result) {
		if (!result.isPublished) {
			result.isPublished = true;
			result.publishedBy = userID;
			result.publishedDate = now;	
		}
		return [result, result.save()];
	})
	.spread(function(result, savedResponse) {
		const updateAtom = Atom.update({ _id: result.parent }, { $set: { isPublished: true} }).exec();
		return [result, updateAtom];
	})
	.spread(function(result, updatedAtom) {
		delete result.content;
		return res.status(201).json(result);
	})
	.catch(function(error) {
		console.log('error', error);
		return res.status(500).json(error);
	});

}
app.post('/setVersionPublished', setVersionPublished);
