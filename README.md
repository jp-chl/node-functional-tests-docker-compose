# POC Tests with containers

This tests run two simple endpoints which are tested by a docker image using docker-compose.

> Based on [https://medium.com/pipedrive-engineering/functional-tests-for-docker-microservices-119609e64fde](https://medium.com/pipedrive-engineering/functional-tests-for-docker-microservices-119609e64fde)

---

## Running tests

To run tests located at file [environment.js](./test/functional/environment.js), run:

```bash
node test/functional/environment.js
```

A docker image starts and ends while tests are running:

<a href="https://asciinema.org/a/Qxv17KOfHZkfLQsuxc5A8RYxZ" target="_blank"><img src="https://asciinema.org/a/Qxv17KOfHZkfLQsuxc5A8RYxZ.svg" /></a>


Test results:

<a href="https://asciinema.org/a/kXrbLL04OCiKUGCvHOYJVOdXn" target="_blank"><img src="https://asciinema.org/a/kXrbLL04OCiKUGCvHOYJVOdXn.svg" /></a>
