const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')

const app = express()
const PORT = process.env.PORT || 3001

const password = process.argv[2]

const mongoUrl = `mongodb://hrishi03512_db_user:${password}@ac-qtrqdm4-shard-00-00.1oje5pz.mongodb.net:27017,ac-qtrqdm4-shard-00-01.1oje5pz.mongodb.net:27017,ac-qtrqdm4-shard-00-02.1oje5pz.mongodb.net:27017/phonebook?ssl=true&replicaSet=atlas-x47ltl-shard-0&authSource=admin&retryWrites=true&w=majority&appName=phonebook`

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', request => {
  return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
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

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  Person.findOne({ name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }

      const person = new Person({
        name,
        number
      })

      return person.save()
    })
    .then(savedPerson => {
      if (savedPerson) {
        response.json(savedPerson)
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
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

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(deletedPerson => {
      if (deletedPerson) {
        response.status(204).end()
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknown endpoint'
  })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({
      error: 'malformatted id'
    })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  }

  next(error)
}

app.use(errorHandler)

mongoose
  .connect(mongoUrl, { family: 4 })
  .then(() => {
    console.log('connected to MongoDB')

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(error => {
    console.error('error connecting to MongoDB:', error.message)
    process.exit(1)
  })