const mongoose = require('mongoose')

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb://hrishi03512_db_user:${password}@ac-qtrqdm4-shard-00-00.1oje5pz.mongodb.net:27017,ac-qtrqdm4-shard-00-01.1oje5pz.mongodb.net:27017,ac-qtrqdm4-shard-00-02.1oje5pz.mongodb.net:27017/phonebook?ssl=true&replicaSet=atlas-x47ltl-shard-0&authSource=admin&retryWrites=true&w=majority&appName=phonebook`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name,
  number
})

person.save().then(() => {
  console.log(`added ${name} number ${number} to phonebook`)
  mongoose.connection.close()
})