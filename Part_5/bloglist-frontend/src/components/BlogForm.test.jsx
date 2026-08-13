import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  test('calls createBlog with the correct details when submitted', async () => {
    const user = userEvent.setup()
    const createBlog = vi.fn()

    render(<BlogForm createBlog={createBlog} />)

    const titleInput = screen.getByLabelText('title')
    const authorInput = screen.getByLabelText('author')
    const urlInput = screen.getByLabelText('url')

    await user.type(titleInput, 'My new blog')
    await user.type(authorInput, 'John Doe')
    await user.type(urlInput, 'https://example.com')

    await user.click(screen.getByText('create'))

    expect(createBlog).toHaveBeenCalledWith({
      title: 'My new blog',
      author: 'John Doe',
      url: 'https://example.com'
    })
  })
})