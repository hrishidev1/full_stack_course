const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', {
      username: 1,
      name: 1
    })

    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
  try {
    const user = request.user
    const body = request.body

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    const populatedBlog = await savedBlog.populate('user', {
      username: 1,
      name: 1
    })

    response.status(201).json(populatedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
  try {
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response.status(404).end()
    }

    if (blog.user.toString() !== user._id.toString()) {
      return response.status(401).json({
        error: 'only the creator can delete the blog'
      })
    }

    await Blog.findByIdAndDelete(request.params.id)

    user.blogs = user.blogs.filter(
      blogId => blogId.toString() !== blog._id.toString()
    )

    await user.save()

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const { likes } = request.body

    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response.status(404).end()
    }

    blog.likes = likes

    const updatedBlog = await blog.save()

    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter