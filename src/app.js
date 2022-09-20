const express = require('express');
const userRouter = require('./user/UserRouter');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');

i18next.use(Backend).use(i18nextMiddleware.LanguageDetector).init({
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
        loadPath: 'locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en',
    debug: true,
    detection: {
        lookupHeader: 'accept-language',
    },
});

// create express app
const app = express();

app.use(i18nextMiddleware.handle(i18next));
app.use(express.json());

app.use(userRouter);
 
module.exports = app;