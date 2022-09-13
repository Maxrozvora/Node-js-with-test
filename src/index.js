const app = require('../src/app');
const sequalize = require('../src/config/database');

sequalize.sync();

app.listen(5000, () => {
    console.log('Server listening on port 5000');
});