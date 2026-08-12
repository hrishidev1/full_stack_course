const jwt = require('jsonwebtoken')
const User = require('../models/user')
const logger = require('./logger')

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return response.status(400).json({
      error: 'expected `username` to be unique'
    })
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'token invalid'
    })
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }

  next()
}

const userExtractor = async (request, response, next) => {
  try {
    if (!request.token) {
      return response.status(401).json({
        error: 'token missing'
      })
    }

    const decodedToken = jwt.verify(
      request.token,
      process.env.SECRET
    )

    const user = await User.findById(decodedToken.id)

    if (!user) {
      return response.status(401).json({
        error: 'user not found'
      })
    }

    request.user = user

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}