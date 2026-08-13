import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [currentBlog, setCurrentBlog] = useState(blog)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const likeBlog = async () => {
    const updatedBlog = {
      ...currentBlog,
      likes: currentBlog.likes + 1,
      user: currentBlog.user?.id || currentBlog.user?._id
    }

    const returnedBlog = await blogService.update(
      currentBlog.id,
      updatedBlog
    )

    const blogWithUser = {
      ...returnedBlog,
      user: currentBlog.user
    }

    setCurrentBlog(blogWithUser)
    updateBlog(blogWithUser)
  }

  const userIsCreator =
    currentBlog.user &&
    user &&
    (currentBlog.user.id === user.id ||
      currentBlog.user._id === user.id)

  return (
    <div>
      <div>
        {currentBlog.title} {currentBlog.author}

        <button onClick={toggleDetails}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>

      {showDetails && (
        <div>
          <div>{currentBlog.url}</div>

          <div>
            likes {currentBlog.likes}
            <button onClick={likeBlog}>like</button>
          </div>

          <div>{currentBlog.user?.name}</div>

          {userIsCreator && (
            <button onClick={() => deleteBlog(currentBlog)}>
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog