const { ESLint } = require('eslint');
const Crypto = require('node:crypto');
const Path = require('node:path');

/**
 * @param {any[]} data
 */
function fingerprint(data) {
	const hash = Crypto.createHash('md5');

	for (const part of data) {
		// Skip empty values
		if (!part) continue;

		hash.update(part.toString());
	}

	return hash.digest('hex');
}

/**
 * @param {string} path
 * @param {ESLint.LintResultData} context
 * @returns {string}
 */
function getRelativePath(path, context) {
	const root = process.env.CI_PROJECT_DIR ?? context.cwd;
	return Path.relative(root, path);
}

/**
 * @param {ESLint.LintResult[]} results
 * @param {ESLint.LintResultData} context
 * @returns {GitLabCodeQuality.Issue[]}
 */
function convert(results, context) {
	/** @type {GitLabCodeQuality.Issue[]} */
	const issues = [];

	for (const result of results) {
		for (const message of result.messages) {
			// Skip severity "off"
			if (message.severity === 0) continue;

			issues.push({
				description: message.message,
				check_name: message.ruleId ?? 'unknown',
				fingerprint: fingerprint([result.filePath, message.line, message.ruleId, message.message]),
				severity: message.fatal ? 'critical' : message.severity === 1 ? 'minor' : 'major',
				location: {
					path: getRelativePath(result.filePath, context),
					lines: {
						begin: message.line,
					},
				},
			});
		}
	}

	return issues;
}

/**
 * @param {ESLint.LintResult[]} results
 * @param {ESLint.LintResultData} context
 * @returns {Promise<string>}
 */
module.exports = async function (results, context) {
	// Create console formatter
	const instance = new ESLint();
	const consoleFormatter = await instance.loadFormatter('stylish');

	// Output console
	const consoleOutput = await consoleFormatter.format(results, context);
	process.stdout.write(consoleOutput);

	// Generate GitLab Code Quality JSON
	const issues = convert(results, context);

	// Format as JSON and return
	const json = JSON.stringify(issues, null, '\t');
	return json;
};
