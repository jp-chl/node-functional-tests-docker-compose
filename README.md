
# POC Tests with containers
This consists of two simple endpoints which are tested by a docker image using docker-compose.

Environment:

* MacOs Catalina 10.15.7
* npm '6.14.6'

> _Based on [https://medium.com/pipedrive-engineering/functional-tests-for-docker-microservices-119609e64fde](https://medium.com/pipedrive-engineering/functional-tests-for-docker-microservices-119609e64fde)_

---

## Running tests

### First approach

To run tests located at file [environment.js](./test/functional/environment.js), run:

```bash
node test/functional/environment.js
```

A docker image starts and ends while tests are running:

<a href="https://asciinema.org/a/Qxv17KOfHZkfLQsuxc5A8RYxZ" target="_blank"><img src="https://asciinema.org/a/Qxv17KOfHZkfLQsuxc5A8RYxZ.svg" /></a>


Test results:

<a href="https://asciinema.org/a/kXrbLL04OCiKUGCvHOYJVOdXn" target="_blank"><img src="https://asciinema.org/a/kXrbLL04OCiKUGCvHOYJVOdXn.svg" /></a>

---

### Adding CI, dev mode and code coverage

```bash
npm install path
```

```bash
npm install minimist
```

```bash
# Code coverage report
npm install nyc
```

Several docker-compose files are added:

* [docker-compose.test-base.yml](./test/functional/tests/docker-compose.test-base.yml)

* [docker-compose.test-image.yml](./test/functional/tests/docker-compose.test-image.yml)

* [docker-compose.test-development.yml](./test/functional/tests/docker-compose.test-development.yml)

* [docker-compose.test-coverage.yml](./test/functional/tests/docker-compose.test-coverage.yml)

Now, all docker-composes are built dynamically by adding command line parameters.

A docker image starts and ends while tests are running:

<a href="https://asciinema.org/a/Qxv17KOfHZkfLQsuxc5A8RYxZ" target="_blank"><img src="https://asciinema.org/a/Qxv17KOfHZkfLQsuxc5A8RYxZ.svg" /></a>


Start environment:

```bash
node test/functional/environment-improved.js "--start-environment" "--measure-coverage"
```

Run tests:

```bash
node test/functional/environment-improved.js
```

Write coverage report:

```bash
node test/functional/environment-improved.js "--write-coverage-report"
```

Stop environment:

```bash
node test/functional/environment-improved.js "--stop-environment"
```

<a href="https://asciinema.org/a/kXrbLL04OCiKUGCvHOYJVOdXn" target="_blank"><img src="https://asciinema.org/a/kXrbLL04OCiKUGCvHOYJVOdXn.svg" /></a>

Acess to coverage report:

```bash
open testdata/coverage/lcov-report/index.html
```
