import routes from "./routes/Routes"
import connectDB from "./database/db"

const express = require('express')
const bodyParser = require('body-parser')
const multipart = require('connect-multiparty')
const mongoose = require('mongoose')

const app = express()

app.use(multipart())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

connectDB()

app.listen(9000, () => console.log('Server running on port 9000'))

app.use('/', routes)
app.use('/images', express.static('/tmp'))
export default app
