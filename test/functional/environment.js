const Mocha = require('mocha');
const shelljs = require('shelljs');
const retry = require('bluebird-retry');
const readdir = require('recursive-readdir');
const request = require('request-promise-native');

const dockerComposeConfig = `${__dirname}/docker-compose.test.yml`;

const ctx = {
	serviceBaseUrl: 'http://localhost:8080'
};

global.ctx = ctx;

async function runCommand(cmd) {
	console.log(`DEBUG: executing command: ${cmd}`);

	return new Promise((resolve, reject) => {
		shelljs.exec(cmd, (code, stdout, stderr) => {
			if (code !== 0) {
				return reject(`command ${cmd} exited with code: ${code}`);
			}

			return resolve([stdout, stderr]);
		});
	});
}

async function startContainers() {
	await runCommand(`docker-compose -f ${dockerComposeConfig} up -d`);
}

async function killContainers() {
    console.log("MATANDO...");
    await runCommand(`docker-compose -f ${dockerComposeConfig} kill`);
    console.log("MATADO...");
}

async function waitForContainers() {
	await retry(() => {
		console.log('DEBUG: waiting for my-service to start..');
		return request(`${ctx.serviceBaseUrl}/health`);
	});
}

async function startEnvironment() {
	await startContainers();
	await waitForContainers();
}

async function stopEnvironment() {
	await killContainers();
}

async function runTests() {
	const files = await readdir(`${__dirname}/tests`);
	const mocha = new Mocha();

	files.map((f) => mocha.addFile(f));

	return new Promise((resolve, reject) => {
		mocha.run((fail) => {
			return fail ? reject('tests failed') : resolve();
		});
	});
}

async function main() {
	try {
		await startEnvironment();
		await runTests();
		await stopEnvironment();
	} catch (e) {
        console.log(`test run failed: ${e}`);
		process.exit(1);
	}
}

main();
