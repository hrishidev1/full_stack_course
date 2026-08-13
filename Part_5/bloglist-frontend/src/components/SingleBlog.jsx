import { useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import blogService from '../services/blogs'

const BlogContainer = styled.article`
  max-width: 720px;
  margin: 40px auto;
  padding: 32px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`

const BlogTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 2rem;
`

const BlogAuthor = styled.p`
  margin: 0 0 24px;
  color: #666;
  font-size: 1.05rem;
`

const BlogUrl = styled.a`
  display: inline-block;
  margin-bottom: 24px;
  color: #646cff;
  word-break: break-word;
`

const BlogMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`

const Likes = styled.span`
  font-weight: 600;
`

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const DeleteButton = styled(ActionButton)`
  background: #dc3545;
  color: white;
`

const LikeButton = styled(ActionButton)`
  background: #646cff;
  color: white;
`

const Creator = styled.p`
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid #eee;
  color: #666;
`

const NotFound = styled.div`
  max-width: 720px;
  margin: 40px auto;
  padding: 24px;
  text-align: center;
`

const SingleBlog = ({ blogs, updateBlog, deleteBlog, user }) => {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)

  const blog = blogs.find(blog => blog.id === id)

  if (!blog) {
    return <NotFound>blog not found</NotFound>
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
    <BlogContainer>
      <BlogTitle>{blog.title}</BlogTitle>

      <BlogAuthor>
        <span>by </span>
        <span>{blog.author}</span>
      </BlogAuthor>

      <BlogUrl
        href={blog.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {blog.url}
      </BlogUrl>

      <BlogMeta>
        <Likes>likes {blog.likes}</Likes>

        {user && (
          <LikeButton
            className="like-button"
            onClick={likeBlog}
            disabled={loading}
          >
            like
          </LikeButton>
        )}
      </BlogMeta>

      <Creator>
        <span>added by </span>
        <span>{blog.user?.name}</span>
      </Creator>

      {userIsCreator && (
        <DeleteButton
          onClick={() => deleteBlog(blog)}
        >
          remove
        </DeleteButton>
      )}
    </BlogContainer>
  )
}

export default SingleBlog