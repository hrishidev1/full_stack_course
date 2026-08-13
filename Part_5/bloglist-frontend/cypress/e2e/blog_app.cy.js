describe('Blog app', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')

    cy.request('POST', 'http://localhost:3003/api/users', {
      name: 'Test User',
      username: 'testuser',
      password: 'secretpassword'
    })

    cy.visit('http://localhost:5173')
  })

  const login = () => {
    cy.get('input[type="text"]').type('testuser')
    cy.get('input[type="password"]').type('secretpassword')
    cy.get('button[type="submit"]').click()

    cy.contains('Test User logged in')
  }

  const createBlog = (title, author, url) => {
    cy.contains('create new blog').click()

    cy.get('input').eq(0).type(title)
    cy.get('input').eq(1).type(author)
    cy.get('input').eq(2).type(url)

    cy.get('button[type="submit"]').click()

    cy.contains(title)
  }

  const likeBlog = (title, times) => {
    cy.contains(title)
      .parent()
      .contains('view')
      .click()

    for (let i = 0; i < times; i++) {
      cy.contains(title)
        .parent()
        .parent()
        .contains('like')
        .click()
    }
  }

  it('Login form is shown', () => {
    cy.contains('Log in to application')
    cy.contains('username')
    cy.contains('password')
    cy.contains('login')
  })

  describe('Login', () => {
    it('succeeds with correct credentials', () => {
      login()
    })

    it('fails with wrong credentials', () => {
      cy.get('input[type="text"]').type('testuser')
      cy.get('input[type="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()

      cy.contains('wrong username or password')
    })
  })

  describe('When logged in', () => {
    beforeEach(() => {
      login()
    })

    it('A blog can be created', () => {
      createBlog(
        'My Cypress Blog',
        'Cypress Author',
        'https://example.com/cypress'
      )

      cy.contains('Cypress Author')
    })

    it('A blog can be liked', () => {
      createBlog(
        'Blog To Like',
        'Cypress Author',
        'https://example.com/like'
      )

      likeBlog('Blog To Like', 1)

      cy.contains('likes 1')
    })

    it('The creator can delete a blog', () => {
      createBlog(
        'My Cypress Blog',
        'Cypress Author',
        'https://example.com/cypress'
      )

      cy.contains('My Cypress Blog')
        .parent()
        .contains('view')
        .click()

      cy.on('window:confirm', () => true)

      cy.contains('remove').click()

      cy.contains('My Cypress Blog').should('not.exist')
    })

    it('Blogs are ordered by likes', () => {
      createBlog(
        'Blog A',
        'Author A',
        'https://example.com/a'
      )

      createBlog(
        'Blog B',
        'Author B',
        'https://example.com/b'
      )

      createBlog(
        'Blog C',
        'Author C',
        'https://example.com/c'
      )

      likeBlog('Blog A', 1)
      likeBlog('Blog B', 2)
      likeBlog('Blog C', 3)

      cy.get('body').then(body => {
        const text = body.text()

        expect(text.indexOf('Blog C')).to.be.lessThan(
          text.indexOf('Blog B')
        )

        expect(text.indexOf('Blog B')).to.be.lessThan(
          text.indexOf('Blog A')
        )
      })
    })
  })
})