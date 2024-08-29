import { GeminiService } from "./services/GeminiService";
import routes from "./routes/Routes";
import db from "./database/db";
import connectDB from "./database/db";

const express = require('express');
const bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const mongoose = require('mongoose');
 connectDB();

const app = express();

app.use(multipart());       // to support JSON-encoded bodies
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
// mongoose
//   .connect('mongodb://db:27017/crud-node-mongo-docker', {
//     useNewUrlParser: true
//   })
//   .then(result => {
//     console.log('MongoDB Conectado');
//   })
//   .catch(error => {
//     console.log(error);
//   });

app.listen(9000, () => console.log('Server ativo na porta 9000'));

app.use('/', routes)
app.use('/images', express.static('/tmp'));
export default app;
