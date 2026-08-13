import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import blogService from '../services/blogs'

vi.mock('../services/blogs', () => ({
  default: {
    update: vi.fn()
  }
}))

describe('<Blog />', () => {
  const blog = {
    id: '123',
    title: 'Testing React components',
    author: 'John Doe',
    url: 'https://example.com/testing',
    likes: 5,
    user: {
      id: '123',
      name: 'John Doe'
    }
  }

  const renderBlog = (updateBlog = () => {}) => {
    return render(
      <Blog
        blog={blog}
        updateBlog={updateBlog}
        deleteBlog={() => {}}
        user={blog.user}
      />
    )
  }

  test('renders title and author', () => {
    renderBlog()

    screen.getByText('Testing React components John Doe')
  })

  test('does not render URL or likes by default', () => {
    renderBlog()

    expect(
      screen.queryByText('https://example.com/testing')
    ).not.toBeInTheDocument()

    expect(
      screen.queryByText('likes 5')
    ).not.toBeInTheDocument()
  })

  test('renders URL and likes when view button is clicked', async () => {
    const user = userEvent.setup()

    renderBlog()

    await user.click(screen.getByText('view'))

    expect(
      screen.getByText('https://example.com/testing')
    ).toBeInTheDocument()

    expect(
      screen.getByText('likes 5')
    ).toBeInTheDocument()
  })

  test('calls updateBlog twice when like button is clicked twice', async () => {
    const user = userEvent.setup()
    const updateBlog = vi.fn()

    blogService.update.mockResolvedValue(blog)

    renderBlog(updateBlog)

    await user.click(screen.getByText('view'))

    const likeButton = screen.getByText('like')

    await user.click(likeButton)
    await user.click(likeButton)

    expect(updateBlog).toHaveBeenCalledTimes(2)
  })
})