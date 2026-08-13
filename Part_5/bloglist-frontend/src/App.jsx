import { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from 'react-router-dom'

import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import SingleBlog from './components/SingleBlog'
import blogService from './services/blogs'
import loginService from './services/login'


const Login = ({
  username,
  password,
  setUsername,
  setPassword,
  handleLogin,
  notification
}) => {
  return (
    <div>
      <h2>Log in to application</h2>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
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


const BlogList = ({
  blogs,
  user,
  updateBlog,
  deleteBlog,
  notification
}) => {
  return (
    <div>
      <h2>blogs</h2>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}

      <p>
        {user.name} logged in
        <button onClick={user.logout}>logout</button>
      </p>

      {blogs.map(blog => (
        <Blog
          key={blog.id}
          blog={blog}
          updateBlog={updateBlog}
          deleteBlog={deleteBlog}
          user={user}
        />
      ))}
    </div>
  )
}


const CreateBlog = ({ createBlog }) => {
  const navigate = useNavigate()

  const handleCreate = async blogObject => {
    await createBlog(blogObject)
    navigate('/')
  }

  return (
    <div>
      <h2>create new blog</h2>

      <BlogForm createBlog={handleCreate} />

      <button onClick={() => navigate('/')}>
        cancel
      </button>
    </div>
  )
}


const SingleBlogRoute = ({
  blogs,
  updateBlog,
  deleteBlog,
  user
}) => {
  const navigate = useNavigate()

  const handleDelete = async blog => {
    await deleteBlog(blog)
    navigate('/')
  }

  return (
    <SingleBlog
      blogs={blogs}
      updateBlog={updateBlog}
      deleteBlog={handleDelete}
      user={user}
    />
  )
}


const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    blogService.getAll().then(initialBlogs => {
      setBlogs(initialBlogs)
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
      showNotification(
        'wrong username or password',
        'error'
      )
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBloglistUser')
    setUser(null)
    blogService.setToken(null)
  }

  const addBlog = async blogObject => {
    try {
      const returnedBlog = await blogService.create(blogObject)

      setBlogs(currentBlogs =>
        currentBlogs.concat(returnedBlog)
      )

      showNotification(
        `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
        'success'
      )

      return returnedBlog
    } catch {
      showNotification(
        'failed to add blog',
        'error'
      )

      throw new Error('failed to add blog')
    }
  }

  const updateBlog = updatedBlog => {
    setBlogs(currentBlogs =>
      currentBlogs.map(blog =>
        blog.id === updatedBlog.id
          ? updatedBlog
          : blog
      )
    )
  }

  const deleteBlog = async blog => {
    try {
      await blogService.remove(blog.id)

      setBlogs(currentBlogs =>
        currentBlogs.filter(item => item.id !== blog.id)
      )

      showNotification(
        `blog '${blog.title}' removed`,
        'success'
      )
    } catch {
      showNotification(
        'failed to remove blog',
        'error'
      )

      throw new Error('failed to remove blog')
    }
  }

  const userWithLogout = user
    ? {
        ...user,
        logout: handleLogout
      }
    : null

  return (
    <Router>
      <div>
        <nav>
          <Link to="/">blogs</Link>{' '}

          {user && (
            <Link to="/create">
              create new blog
            </Link>
          )}

          {!user && (
            <Link to="/login">
              login
            </Link>
          )}
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <BlogList
                  blogs={blogs}
                  user={userWithLogout}
                  updateBlog={updateBlog}
                  deleteBlog={deleteBlog}
                  notification={notification}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/blogs/:id"
            element={
              user ? (
                <SingleBlogRoute
                  blogs={blogs}
                  updateBlog={updateBlog}
                  deleteBlog={deleteBlog}
                  user={user}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/create"
            element={
              user ? (
                <CreateBlog createBlog={addBlog} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Login
                  username={username}
                  password={password}
                  setUsername={setUsername}
                  setPassword={setPassword}
                  handleLogin={handleLogin}
                  notification={notification}
                />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App