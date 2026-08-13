import { useState } from 'react'
import { useParams } from 'react-router-dom'
import blogService from '../services/blogs'

const SingleBlog = ({ blogs, updateBlog, deleteBlog, user }) => {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)

  const blog = blogs.find(blog => blog.id === id)

  if (!blog) {
    return <div>blog not found</div>
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
    <div className="single-blog">
      <h2>{blog.title}</h2>

      <div>{blog.author}</div>

      <div>
        <a href={blog.url}>{blog.url}</a>
      </div>

      <div>
        likes {blog.likes}

        {user && (
          <button
            className="like-button"
            onClick={likeBlog}
            disabled={loading}
          >
            like
          </button>
        )}
      </div>

      <div>{blog.user?.name}</div>

      {userIsCreator && (
        <button onClick={() => deleteBlog(blog)}>
          remove
        </button>
      )}
    </div>
  )
}

export default SingleBlog