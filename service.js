const express = require('express');
const app = express();

app.get('/health', async(req, res) => {
    res.status(200).send({status: 'ok'});
});

app.get('/api/answer', async(req, res) => {
    res.status(200).send({answer: 42});
});

// simulate startup time

setTimeout(() => {
    console.log("Service listening on port 8080...");
    app.listen(8080);
});