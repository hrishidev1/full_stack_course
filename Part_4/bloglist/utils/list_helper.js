const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((favorite, blog) => {
    return blog.likes > favorite.likes ? blog : favorite
  })
}

const mostBlogs = (blogs) => {
  const blogCounts = {}

  blogs.forEach(blog => {
    blogCounts[blog.author] = (blogCounts[blog.author] || 0) + 1
  })

  return Object.entries(blogCounts).reduce((most, [author, blogs]) => {
    return blogs > most.blogs
      ? { author, blogs }
      : most
  }, { author: '', blogs: 0 })
}

const mostLikes = (blogs) => {
  const likesByAuthor = {}

  blogs.forEach(blog => {
    likesByAuthor[blog.author] =
      (likesByAuthor[blog.author] || 0) + blog.likes
  })

  return Object.entries(likesByAuthor).reduce((most, [author, likes]) => {
    return likes > most.likes
      ? { author, likes }
      : most
  }, { author: '', likes: 0 })
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}