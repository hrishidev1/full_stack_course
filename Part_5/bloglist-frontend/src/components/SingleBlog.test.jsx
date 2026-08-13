import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import SingleBlog from './SingleBlog'

const blog = {
  id: '123',
  title: 'Testing React components',
  author: 'John Doe',
  url: 'https://example.com',
  likes: 5,
  user: {
    id: '123',
    name: 'Test User'
  }
}

const renderBlog = user => {
  return render(
    <MemoryRouter initialEntries={['/blogs/123']}>
      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <SingleBlog
              blogs={[blog]}
              updateBlog={vi.fn()}
              deleteBlog={vi.fn()}
              user={user}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('<SingleBlog />', () => {
  it('shows blog information and likes to unauthenticated users but no buttons', () => {
    renderBlog(null)

    expect(
      screen.getByText('Testing React components')
    ).toBeInTheDocument()

    expect(
      screen.getByText('John Doe')
    ).toBeInTheDocument()

    expect(
      screen.getByText('https://example.com')
    ).toBeInTheDocument()

    expect(
      screen.getByText('likes 5')
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button')
    ).not.toBeInTheDocument()
  })

  it('shows only the like button to authenticated non-creators', () => {
    renderBlog({
      id: '456',
      name: 'Another User'
    })

    expect(
      screen.getByRole('button', { name: 'like' })
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'remove' })
    ).not.toBeInTheDocument()
  })

  it('shows the like and delete buttons to the creator', () => {
    renderBlog({
      id: '123',
      name: 'Test User'
    })

    expect(
      screen.getByRole('button', { name: 'like' })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'remove' })
    ).toBeInTheDocument()
  })
})