import { test, expect } from '@playwright/test'

const resetDatabase = async request => {
  await request.post('http://localhost:3003/api/testing/reset')

  await request.post('http://localhost:3003/api/users', {
    data: {
      name: 'Test User',
      username: 'testuser',
      password: 'secretpassword'
    }
  })
}

const login = async (
  page,
  username = 'testuser',
  password = 'secretpassword'
) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('link', { name: 'create new blog' }).click()

  await expect(
    page.getByRole('heading', { name: 'create new blog' })
  ).toBeVisible()

  await page.getByLabel('title').fill(title)
  await page.getByLabel('author').fill(author)
  await page.getByLabel('url').fill(url)

  await page.getByRole('button', { name: 'create' }).click()

  const blog = page
    .getByRole('link', { name: title, exact: true })
    .locator('..')

  await expect(blog).toBeVisible()

  return blog
}

test.beforeEach(async ({ request }) => {
  await resetDatabase(request)
})

test('Login succeeds with correct credentials', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Log in to application' })
  ).toBeVisible()

  await login(page)

  await expect(
    page.getByText('Test User logged in')
  ).toBeVisible()
})

test('Login fails with incorrect credentials', async ({ page }) => {
  await page.goto('/')

  await login(page, 'testuser', 'wrongpassword')

  await expect(
    page.getByText('wrong username or password')
  ).toBeVisible()

  await expect(
    page.getByText('Test User logged in')
  ).not.toBeVisible()
})

test('A logged-in user can create a blog', async ({ page }) => {
  const title = `Playwright Blog ${Date.now()}`
  const author = 'Playwright Author'
  const url = 'https://example.com/playwright'

  await page.goto('/')
  await login(page)

  await expect(
    page.getByText('Test User logged in')
  ).toBeVisible()

  const blog = await createBlog(page, title, author, url)

  await expect(
    blog.getByText(author, { exact: true })
  ).toBeVisible()
})

test('A logged-in user can like a blog', async ({ page }) => {
  await page.goto('/')
  await login(page)

  await expect(
    page.getByText('Test User logged in')
  ).toBeVisible()

  const blog = await createBlog(
    page,
    'Blog To Like',
    'Cypress Author',
    'https://example.com/like'
  )

  await blog.getByRole('link', { name: 'Blog To Like' }).click()

  await expect(
    page.getByText('likes 0')
  ).toBeVisible()

  await page.getByRole('button', { name: 'like' }).click()

  await expect(
    page.getByText('likes 1')
  ).toBeVisible()
})

test('A logged-in user can delete a blog', async ({ page }) => {
  await page.goto('/')
  await login(page)

  await expect(
    page.getByText('Test User logged in')
  ).toBeVisible()

  await createBlog(
    page,
    'Blog To Delete',
    'Delete Author',
    'https://example.com/delete'
  )

  const blog = page.getByRole('link', {
    name: 'Blog To Delete',
    exact: true
  })

  await blog.click()

  await expect(
    page.getByRole('button', { name: 'remove' })
  ).toBeVisible()

  await page.getByRole('button', { name: 'remove' }).click()

  await expect(
    page.getByRole('link', {
      name: 'Blog To Delete',
      exact: true
    })
  ).not.toBeVisible()
})