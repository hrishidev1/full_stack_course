import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi, describe } from 'vitest'
import Blog from './Blog'

import blogService from '../services/blogs'

vi.mock('../services/blogs')

const blog = {
  id: '123',
  title: 'Testing React components',
  author: 'John Doe',
  url: 'https://example.com',
  likes: 0,
  user: {
    id: '123',
    name: 'Test User'
  }
}

const renderBlog = (props = {}) => {
  return render(
    <MemoryRouter>
      <Blog
        blog={blog}
        updateBlog={vi.fn()}
        deleteBlog={vi.fn()}
        user={blog.user}
        {...props}
      />
    </MemoryRouter>
  )
}

describe('<Blog />', () => {
  test('renders title and author', () => {
    renderBlog()

    expect(
      screen.getByText('Testing React components')
    ).toBeInTheDocument()

    expect(
      screen.getByText('John Doe')
    ).toBeInTheDocument()
  })

  test('does not render URL or likes by default', () => {
    renderBlog()

    expect(
      screen.queryByText('https://example.com')
    ).not.toBeInTheDocument()

    expect(
      screen.queryByText(/likes/)
    ).not.toBeInTheDocument()
  })

  test('renders URL and likes when view button is clicked', async () => {
    const user = userEvent.setup()

    renderBlog()

    await user.click(screen.getByText('view'))

    expect(
      screen.getByText('https://example.com')
    ).toBeInTheDocument()

    expect(
      screen.getByText('likes 0')
    ).toBeInTheDocument()
  })

  test('calls updateBlog twice when like button is clicked twice', async () => {
    const user = userEvent.setup()
    const updateBlog = vi.fn()

    blogService.update
      .mockResolvedValueOnce({
        ...blog,
        likes: 1
      })
      .mockResolvedValueOnce({
        ...blog,
        likes: 2
      })

    renderBlog({ updateBlog })

    await user.click(screen.getByText('view'))

    const likeButton = screen.getByText('like')

    await user.click(likeButton)
    await user.click(likeButton)

    expect(blogService.update).toHaveBeenCalledTimes(2)
    expect(updateBlog).toHaveBeenCalledTimes(2)
  })
})