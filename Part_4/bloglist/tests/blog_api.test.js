const bcrypt = require('bcryptjs')
const User = require('../models/user')
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

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  await Blog.insertMany(initialBlogs)

  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash: await bcrypt.hash('secretpassword', 10)
  })

  await user.save()

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'secretpassword'
    })

  token = loginResponse.body.token
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
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.title, newBlog.title)
  assert.strictEqual(response.body.author, newBlog.author)
  assert.strictEqual(response.body.url, newBlog.url)
  assert.strictEqual(response.body.likes, newBlog.likes)
  assert.ok(response.body.id)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(
    blogsAtEnd.length,
    initialBlogs.length + 1
  )
})

test('a blog without likes defaults to zero', async () => {
  const newBlog = {
    title: 'Blog Without Likes',
    author: 'Test Author',
    url: 'https://example.com/no-likes'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
    .send(blogWithoutUrl)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.ok(responseWithoutUrl.body.error)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(
    blogsAtEnd.length,
    initialBlogs.length
  )
})

test('a blog can be added only with a valid token', async () => {
  const newBlog = {
    title: 'Unauthorized Test Blog',
    author: 'Test Author',
    url: 'https://example.com/unauthorized',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  assert.ok(response.body.error)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(
    blogsAtEnd.length,
    initialBlogs.length
  )
})

test('a blog can be deleted', async () => {
  const user = await User.findOne({})

  const blogToDelete = new Blog({
    title: 'Blog To Delete',
    author: 'Test Author',
    url: 'https://example.com/delete',
    likes: 5,
    user: user._id
  })

  const savedBlog = await blogToDelete.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  const blogsAtStart = await Blog.find({})

  await api
    .delete(`/api/blogs/${savedBlog.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(
    blogsAtEnd.length,
    blogsAtStart.length - 1
  )

  assert.strictEqual(
    blogsAtEnd.some(blog => blog.id === savedBlog.id),
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

test('a user can be created', async () => {
  await User.deleteMany({})

  const newUser = {
    username: 'testuser',
    name: 'Test User',
    password: 'secretpassword'
  }

  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.username, newUser.username)
  assert.strictEqual(response.body.name, newUser.name)
  assert.strictEqual(response.body.passwordHash, undefined)

  const user = await User.findOne({
    username: newUser.username
  })

  assert.ok(user)
  assert.notStrictEqual(
    user.passwordHash,
    newUser.password
  )

  const passwordCorrect = await bcrypt.compare(
    newUser.password,
    user.passwordHash
  )

  assert.strictEqual(passwordCorrect, true)
})

test('users can be retrieved', async () => {
  await User.deleteMany({})

  const user = new User({
    username: 'existinguser',
    name: 'Existing User',
    passwordHash: await bcrypt.hash('secretpassword', 10)
  })

  await user.save()

  const response = await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, 1)
  assert.strictEqual(
    response.body[0].username,
    'existinguser'
  )
  assert.strictEqual(
    response.body[0].name,
    'Existing User'
  )
  assert.strictEqual(
    response.body[0].passwordHash,
    undefined
  )
})

test('invalid users are not created', async () => {
  await User.deleteMany({})

  const validUser = {
    username: 'validuser',
    name: 'Valid User',
    password: 'secretpassword'
  }

  await api
    .post('/api/users')
    .send(validUser)
    .expect(201)

  const usersAtStart = await User.find({})

  const invalidUsers = [
    {
      username: 'ab',
      name: 'Short Username',
      password: 'secretpassword'
    },
    {
      username: 'validpassword',
      name: 'Short Password',
      password: 'ab'
    },
    {
      username: 'validuser2',
      name: 'Missing Password'
    },
    {
      name: 'Missing Username',
      password: 'secretpassword'
    },
    {
      username: 'validuser',
      name: 'Duplicate User',
      password: 'anotherpassword'
    }
  ]

  for (const invalidUser of invalidUsers) {
    const response = await api
      .post('/api/users')
      .send(invalidUser)

    assert.strictEqual(response.status, 400)
    assert.ok(response.body.error)
  }

  const usersAtEnd = await User.find({})

  assert.strictEqual(
    usersAtEnd.length,
    usersAtStart.length
  )
})

test('a blog is associated with a user and users contain their blogs', async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const user = new User({
    username: 'blogcreator',
    name: 'Blog Creator',
    passwordHash: await bcrypt.hash('secretpassword', 10)
  })

  const savedUser = await user.save()

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'blogcreator',
      password: 'secretpassword'
    })
    .expect(200)

  const userToken = loginResponse.body.token

  const newBlog = {
    title: 'User Relationship Test Blog',
    author: 'Blog Creator',
    url: 'https://example.com/relationship-test',
    likes: 5
  }

  const blogResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${userToken}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.ok(blogResponse.body.user)

  assert.strictEqual(
    blogResponse.body.user.username,
    savedUser.username
  )

  assert.strictEqual(
    blogResponse.body.user.name,
    savedUser.name
  )

  const blogsResponse = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(
    blogsResponse.body.length,
    1
  )

  assert.strictEqual(
    blogsResponse.body[0].user.username,
    savedUser.username
  )

  const usersResponse = await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(
    usersResponse.body.length,
    1
  )

  assert.strictEqual(
    usersResponse.body[0].username,
    savedUser.username
  )

  assert.strictEqual(
    usersResponse.body[0].blogs.length,
    1
  )

  assert.strictEqual(
    usersResponse.body[0].blogs[0].title,
    newBlog.title
  )
})

after(async () => {
  await mongoose.connection.close()
})