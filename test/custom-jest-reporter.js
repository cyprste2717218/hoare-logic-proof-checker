/// custom-jest-reporter.js
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ImageReporter {
	constructor() {
		this.outputDir = path.join(process.cwd(), 'test-results');
		if (!fs.existsSync(this.outputDir)) {
			fs.mkdirSync(this.outputDir);
		}
	}

	onTestResult(test, testResult, aggregatedResult) {
		this.createDetailedTestResultImage(testResult);
	}

	onRunComplete(testContexts, results) {
		this.createSummaryImage(results);
	}

	calculateTextDimensions(ctx, tests) {
		let maxDescribeWidth = 0;
		let maxTestNameWidth = 0;
		let maxFailureWidth = 0;
		let maxFailureLines = 1;

		tests.forEach(test => {
			const ancestorTitles = test.ancestorTitles.join(' → ');
			const describeWidth = ctx.measureText(ancestorTitles).width;
			const testNameWidth = ctx.measureText(test.title).width;

			if (test.failureMessages && test.failureMessages.length > 0) {
				const failureLines = test.failureMessages[0].split('\n');
				maxFailureLines = Math.max(maxFailureLines, failureLines.length);
				failureLines.forEach(line => {
					const failureWidth = ctx.measureText(line).width;
					maxFailureWidth = Math.max(maxFailureWidth, failureWidth);
				});
			}

			maxDescribeWidth = Math.max(maxDescribeWidth, describeWidth);
			maxTestNameWidth = Math.max(maxTestNameWidth, testNameWidth);
		});

		return {
			describeWidth: Math.ceil(maxDescribeWidth) + 40,
			testNameWidth: Math.ceil(maxTestNameWidth) + 40,
			failureWidth: Math.ceil(maxFailureWidth) + 40,
			maxFailureLines
		};
	}

	createDetailedTestResultImage(testResult) {
		const validAssignTests = testResult.testResults.filter(test =>
			test.ancestorTitles.some(title => title.toLowerCase().includes('assignment')) &&
			test.title.toLowerCase().includes('valid')
		);

		const invalidAssignTests = testResult.testResults.filter(test =>
			test.ancestorTitles.some(title => title.toLowerCase().includes('assignment')) &&
			test.title.toLowerCase().includes('invalid')
		);

		const validSkipTests = testResult.testResults.filter(test =>
			test.ancestorTitles.some(title => title.toLowerCase().includes('skip')) &&
			test.title.toLowerCase().includes('valid')
		);

		const invalidSkipTests = testResult.testResults.filter(test =>
			test.ancestorTitles.some(title => title.toLowerCase().includes('skip')) &&
			test.title.toLowerCase().includes('invalid')
		);

		const syntaxErrorTests = testResult.testResults.filter(test =>
			test.ancestorTitles.some(title =>
				title.toLowerCase().includes('syntax') ||
				title.toLowerCase().includes('error')
			)
		);

		if (validAssignTests.length > 0) {
			this.createTestTypeImage(validAssignTests, 'valid-assignment-law', testResult.testFilePath);
		}
		if (invalidAssignTests.length > 0) {
			this.createTestTypeImage(invalidAssignTests, 'invalid-assignment-law', testResult.testFilePath);
		}
		if (validSkipTests.length > 0) {
			this.createTestTypeImage(validSkipTests, 'valid-skip-law', testResult.testFilePath);
		}
		if (invalidSkipTests.length > 0) {
			this.createTestTypeImage(invalidSkipTests, 'invalid-skip-law', testResult.testFilePath);
		}
		if (syntaxErrorTests.length > 0) {
			this.createTestTypeImage(syntaxErrorTests, 'syntax-errors', testResult.testFilePath);
		}
	}

	getTestCategoryTitle(testType) {
		const titles = {
			'valid-assignment-law': 'Valid Assignment Law Tests',
			'invalid-assignment-law': 'Invalid Assignment Law Tests',
			'valid-skip-law': 'Valid Skip Law Tests',
			'invalid-skip-law': 'Invalid Skip Law Tests',
			'syntax-errors': 'Syntax Error Tests'
		};
		return titles[testType] || testType.toUpperCase();
	}

	createTestTypeImage(tests, testType, testFilePath) {
		const lineHeight = 25;
		const headerHeight = 60;

		const tempCanvas = createCanvas(1, 1);
		const tempCtx = tempCanvas.getContext('2d');
		tempCtx.font = '12px Arial';

		const { describeWidth, testNameWidth, failureWidth, maxFailureLines } = this.calculateTextDimensions(tempCtx, tests);

		const testDetailsHeight = tests.reduce((total, test) => {
			const failureLines = test.failureMessages && test.failureMessages.length > 0
				? test.failureMessages[0].split('\n').length
				: 1;
			return total + (lineHeight * failureLines);
		}, 0);

		const canvasHeight = Math.max(400, headerHeight + testDetailsHeight + 40);

		const statusWidth = 80;
		const durationWidth = 80;
		const failureMessageWidth = Math.max(300, failureWidth);
		const totalWidth = describeWidth + testNameWidth + statusWidth + durationWidth + failureMessageWidth + 100;

		const canvas = createCanvas(totalWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, totalWidth, canvasHeight);

		ctx.fillStyle = 'black';
		ctx.font = 'bold 18px Arial';
		ctx.fillText(`${this.getTestCategoryTitle(testType)} - ${testFilePath}`, 20, 30);

		const passedTests = tests.filter(t => t.status === 'passed').length;
		const failedTests = tests.filter(t => t.status === 'failed').length;
		const pendingTests = tests.filter(t => t.status === 'pending').length;

		ctx.font = '14px Arial';
		ctx.fillText(`Passed: ${passedTests} | Failed: ${failedTests} | Pending: ${pendingTests}`, 20, 55);

		ctx.strokeStyle = '#cccccc';
		ctx.beginPath();
		ctx.moveTo(20, headerHeight);
		ctx.lineTo(totalWidth - 20, headerHeight);
		ctx.stroke();

		const testNameX = 20 + describeWidth;
		const statusX = testNameX + testNameWidth;
		const durationX = statusX + statusWidth;
		const failureX = durationX + durationWidth;

		ctx.fillStyle = '#444444';
		ctx.font = 'bold 14px Arial';
		ctx.fillText('Describe Block', 20, headerHeight + 20);
		ctx.fillText('Test Name', testNameX, headerHeight + 20);
		ctx.fillText('Status', statusX, headerHeight + 20);
		ctx.fillText('Duration', durationX, headerHeight + 20);
		ctx.fillText('Failure Message', failureX, headerHeight + 20);

		let currentY = headerHeight + lineHeight + 20;
		tests.forEach(test => {
			const ancestorTitles = test.ancestorTitles.join(' → ');
			const status = test.status;
			const duration = test.duration ? `${test.duration}ms` : 'N/A';
			const baselineY = currentY;

			ctx.font = '12px Arial';

			ctx.fillStyle = '#666666';
			ctx.fillText(ancestorTitles, 20, currentY);

			ctx.fillStyle = 'black';
			ctx.fillText(test.title, testNameX, currentY);

			ctx.fillStyle = status === 'passed' ? '#2ecc71' :
				status === 'failed' ? '#e74c3c' : '#f1c40f';
			ctx.fillText(status, statusX, currentY);

			ctx.fillStyle = 'black';
			ctx.fillText(duration, durationX, currentY);

			if (test.failureMessages && test.failureMessages.length > 0) {
				ctx.fillStyle = '#e74c3c';
				const failureLines = test.failureMessages[0].split('\n');
				failureLines.forEach((line, index) => {
					ctx.fillText(line, failureX, baselineY + (index * lineHeight));
				});
				currentY += (failureLines.length - 1) * lineHeight;
			}

			currentY += lineHeight;
		});

		const buffer = canvas.toBuffer('image/png');
		fs.writeFileSync(path.join(this.outputDir, `${testType}.png`), buffer);
	}

	createSummaryImage(results) {
		const canvas = createCanvas(1000, 500);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, 1000, 500);

		ctx.fillStyle = '#2c3e50';
		ctx.font = 'bold 24px Arial';
		ctx.fillText('Test Suite Summary', 20, 40);

		ctx.font = '18px Arial';
		const passRate = ((results.numPassedTests / results.numTotalTests) * 100).toFixed(1);

		ctx.fillStyle = '#2ecc71';
		ctx.fillText(`✓ Passed: ${results.numPassedTests}`, 20, 90);

		ctx.fillStyle = '#e74c3c';
		ctx.fillText(`✗ Failed: ${results.numFailedTests}`, 20, 120);

		ctx.fillStyle = '#f1c40f';
		ctx.fillText(`⚠ Pending: ${results.numPendingTests}`, 20, 150);

		ctx.fillStyle = '#2c3e50';
		ctx.fillText(`Total Tests: ${results.numTotalTests}`, 20, 180);
		ctx.fillText(`Pass Rate: ${passRate}%`, 20, 210);
		ctx.fillText(`Total Duration: ${((Date.now() - results.startTime) / 1000).toFixed(2)}s`, 20, 240);

		const buffer = canvas.toBuffer('image/png');
		fs.writeFileSync(path.join(this.outputDir, 'summary.png'), buffer);
	}
}

export default ImageReporter;
