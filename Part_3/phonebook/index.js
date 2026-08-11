const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')

const app = express()
const PORT = process.env.PORT || 3001

const password = process.argv[2]

const mongoUrl = `mongodb://hrishi03512_db_user:${password}@ac-qtrqdm4-shard-00-00.1oje5pz.mongodb.net:27017,ac-qtrqdm4-shard-00-01.1oje5pz.mongodb.net:27017,ac-qtrqdm4-shard-00-02.1oje5pz.mongodb.net:27017/phonebook?ssl=true&replicaSet=atlas-x47ltl-shard-0&authSource=admin&retryWrites=true&w=majority&appName=phonebook`

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (request) => {
  return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const currentTime = new Date()

      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${currentTime}</p>
      `)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const nameExists = persons.some(person => person.name === body.name)

  if (nameExists) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({
    error: 'unknown endpoint'
  })
}

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    })
  }

  next(error)
}

app.use(errorHandler)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})