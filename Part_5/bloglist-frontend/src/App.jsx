import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const [notification, setNotification] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs => {
      setBlogs(blogs)
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(
      'loggedBloglistUser'
    )

    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)

      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const showNotification = (message, type) => {
    setNotification({ message, type })

    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const loggedInUser = await loginService.login({
        username,
        password
      })

      window.localStorage.setItem(
        'loggedBloglistUser',
        JSON.stringify(loggedInUser)
      )

      blogService.setToken(loggedInUser.token)

      setUser(loggedInUser)
      setUsername('')
      setPassword('')

      showNotification('login successful', 'success')
    } catch {
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBloglistUser')
    setUser(null)
  }

  const addBlog = async event => {
    event.preventDefault()

    const blogObject = {
      title: newTitle,
      author: newAuthor,
      url: newUrl
    }

    try {
      const returnedBlog = await blogService.create(blogObject)

      setBlogs(blogs.concat(returnedBlog))

      setNewTitle('')
      setNewAuthor('')
      setNewUrl('')

      showNotification(
        `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
        'success'
      )
    } catch {
      showNotification('failed to add blog', 'error')
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>

        {notification && (
          <div>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div>
            <label>
              username
              <input
                type="text"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </label>
          </div>

          <div>
            <label>
              password
              <input
                type="password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </label>
          </div>

          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>

      {notification && (
        <div>
          {notification.message}
        </div>
      )}

      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>

      <h3>create new</h3>

      <form onSubmit={addBlog}>
        <div>
          <label>
            title
            <input
              type="text"
              value={newTitle}
              onChange={({ target }) => setNewTitle(target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            author
            <input
              type="text"
              value={newAuthor}
              onChange={({ target }) => setNewAuthor(target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            url
            <input
              type="text"
              value={newUrl}
              onChange={({ target }) => setNewUrl(target.value)}
            />
          </label>
        </div>

        <button type="submit">create</button>
      </form>

      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App