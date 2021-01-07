const Mocha = require('mocha');
const shelljs = require('shelljs');
const minimist = require('minimist');
const retry = require('bluebird-retry');
const readdir = require('recursive-readdir');
const request = require('request-promise-native');

const dockerProjectName = 'mytest';

const dockerComposeBase = `${__dirname}/docker-compose.test-base.yml`;
const dockerComposeImage = `${__dirname}/docker-compose.test-image.yml`;
const dockerComposeCoverage = `${__dirname}/docker-compose.test-coverage.yml`;
const dockerComposeDevelopment = `${__dirname}/docker-compose.test-development.yml`;

const ctx = {};

global.ctx = ctx;

let dockerCompose;

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

class DockerCompose {
	constructor(project, configs) {
		this.baseCmd = `docker-compose -p ${project} -f ${configs.join(' -f ')}`;
	}

	run(cmd) {
		return runCommand(`${this.baseCmd} ${cmd}`);
	}

	startContainers() {
		return this.run('up -d');
	}

	killContainers() {
		return this.run('kill');
	}

	removeContainers() {
		return this.run('rm -vf');
	}
}

async function getServiceAddress(serviceName, internalPort) {
	const filters = `-f name=${dockerProjectName}_${serviceName} -f publish=${internalPort}`;
	const command = `docker ps ${filters} --format "{{.Ports}}"`;

	const [output] = await runCommand(command);

	// 0.0.0.0:32769->8080/tcp
	let [ip, port] = output.split(/[:-]/);

	return {
		host: ip === '0.0.0.0' ? '127.0.0.1' : ip,
		port: parseInt(port)
	};
}

async function createTestDataDirectory() {
	await runCommand('mkdir -p -m a+w testdata');
}

async function waitForServices() {
	const address = await getServiceAddress('test-service', 8080);

	ctx.serviceBaseUrl = `http://${address.host}:${address.port}`;

	await retry(() => {
		console.log('DEBUG: waiting for my-service to start...');
		return request(`${ctx.serviceBaseUrl}/health`);
	}, { timeout: 10000 });
}

async function startEnvironment() {
	await createTestDataDirectory();
	await dockerCompose.startContainers();
	await waitForServices();
}

async function stopEnvironment() {
	await dockerCompose.killContainers();
	await dockerCompose.removeContainers();
}

async function writeCoverageReport() {
	try {
		await dockerCompose.run('exec -T test-service sh -c "rm -rf testdata/coverage && kill -s INT 1"');
		await retry(() => {
			return runCommand('test -d testdata/coverage', { timeout: 5000 }); 
		}); 
	} catch (e) {
		console.error(`failed to write coverage report: ${e}`);
	}
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
	const argv = minimist(process.argv);

	const dockerComposeConfigs = [dockerComposeBase];

	if (argv['test-image']) {
		dockerComposeConfigs.push(dockerComposeImage);
	} else if (argv['measure-coverage']) {
		dockerComposeConfigs.push(dockerComposeCoverage);
	} else {
		dockerComposeConfigs.push(dockerComposeDevelopment);
	}

	dockerCompose = new DockerCompose(dockerProjectName, dockerComposeConfigs);

	try {
		if (argv['start-environment']) {
			return await startEnvironment();
		}

		if (argv['stop-environment']) {
			return await stopEnvironment();
		}

		if (argv['write-coverage-report']) {
			return await writeCoverageReport();
		}

		await waitForServices();
		await runTests();
	} catch (e) {
		console.log(`test run failed: ${e}`);
		process.exit(1);
	}
}

main();