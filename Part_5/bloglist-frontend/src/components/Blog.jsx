import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const likeBlog = async () => {
    setLoading(true)
    try {
      const updatedBlog = {
        ...blog,
        likes: blog.likes + 1
      }

      const returnedBlog = await blogService.update(
        blog.id,
        updatedBlog
      )

      const blogWithUser = {
        ...returnedBlog,
        user: blog.user
      }

      updateBlog(blogWithUser)
    } finally {
      setLoading(false)
    }
  }

  const userIsCreator =
    blog.user &&
    user &&
    (blog.user.id === user.id ||
      blog.user._id === user.id)

  return (
    <div className="blog">
      <div className="blog-summary">
        <span className="blog-title">{blog.title}</span>{' '}
        <span className="blog-author">{blog.author}</span>

        <button onClick={toggleDetails}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>

      {showDetails && (
        <div className="blog-details">
          <div className="blog-likes">
            likes {blog.likes}
            <button
              className="like-button"
              onClick={likeBlog}
              disabled={loading}
            >
              like
            </button>
          </div>
          
          <div>{blog.url}</div>

          <div>{blog.user?.name}</div>

          {userIsCreator && (
            <button onClick={() => deleteBlog(blog)}>
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog