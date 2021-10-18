# Backend For Angular Project

## Start the application

- $node index.js

## DEBUG setting

```
const startupDebugger = require('debug')('app:startup');
const deDebugger = require('debug')('app:db');

if(app.get('env' === 'development') {
app.use(morgan('tiny'));
startupDebugger('Morgan enabled...');
}
deDebugger('Connected to the database...');

```

- $export DEBUG=app:startup

- $export DEBUG=app:startup,db

- $export DEBUG=app:db

- $export DEBUG=app:\*

- $DEBUG=app:db nodemon index.js

## packages

- jsonwebtoken
- helmet
- express-fileupload
- winston
- email-templates
- request-ip (not installed Oct.2021 )

## other informations

- For making reports based on large-scale data (such as containing multiple years of data), it is highly recommended to let server run scheduled jobs during low traffic time, cos generally speaking analyzing data is less urgent than crud transaction data. We can use cron to schedule jobs on a Node.js server.
  - npm install express@4.17.1 node-cron@2.0.3
