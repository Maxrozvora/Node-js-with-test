const express = require('express');

// create express app
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});