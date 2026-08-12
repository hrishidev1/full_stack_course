const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')

const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://example.com/dijkstra',
    likes: 5
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, initialBlogs.length)
  assert.ok(response.body[0].id)
  assert.strictEqual(response.body[0]._id, undefined)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'New Test Blog',
    author: 'Test Author',
    url: 'https://example.com/new-blog',
    likes: 10
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.title, newBlog.title)
  assert.strictEqual(response.body.author, newBlog.author)
  assert.strictEqual(response.body.url, newBlog.url)
  assert.strictEqual(response.body.likes, newBlog.likes)
  assert.ok(response.body.id)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)
})

test('a blog without likes defaults to zero', async () => {
  const newBlog = {
    title: 'Blog Without Likes',
    author: 'Test Author',
    url: 'https://example.com/no-likes'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('a blog without title or url is not added', async () => {
  const blogWithoutTitle = {
    author: 'Test Author',
    url: 'https://example.com/no-title',
    likes: 5
  }

  const responseWithoutTitle = await api
    .post('/api/blogs')
    .send(blogWithoutTitle)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.ok(responseWithoutTitle.body.error)

  const blogWithoutUrl = {
    title: 'Blog Without URL',
    author: 'Test Author',
    likes: 5
  }

  const responseWithoutUrl = await api
    .post('/api/blogs')
    .send(blogWithoutUrl)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.ok(responseWithoutUrl.body.error)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
})

test('a blog can be deleted', async () => {
  const blogToDelete = await Blog.findOne({})

  const blogsAtStart = await Blog.find({})

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(
    blogsAtEnd.length,
    blogsAtStart.length - 1
  )

  assert.strictEqual(
    blogsAtEnd.some(blog => blog.id === blogToDelete.id),
    false
  )
})

test('a blog can be updated', async () => {
  const blogToUpdate = await Blog.findOne({})

  const updatedLikes = blogToUpdate.likes + 10

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({
      likes: updatedLikes
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, updatedLikes)

  const updatedBlog = await Blog.findById(blogToUpdate.id)

  assert.strictEqual(updatedBlog.likes, updatedLikes)
})

after(async () => {
  await mongoose.connection.close()
})