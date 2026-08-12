const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)

  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)

    assert.strictEqual(result, 5)
  })

  test('when list has multiple blogs, equals the total likes', () => {
    const blogs = [
      {
        title: 'Blog 1',
        author: 'Author 1',
        url: 'https://example.com/1',
        likes: 5
      },
      {
        title: 'Blog 2',
        author: 'Author 2',
        url: 'https://example.com/2',
        likes: 3
      },
      {
        title: 'Blog 3',
        author: 'Author 3',
        url: 'https://example.com/3',
        likes: 7
      }
    ]

    const result = listHelper.totalLikes(blogs)

    assert.strictEqual(result, 15)
  })
})

describe('favorite blog', () => {
  const blogs = [
    {
      _id: '1',
      title: 'Blog 1',
      author: 'Author 1',
      url: 'https://example.com/1',
      likes: 5
    },
    {
      _id: '2',
      title: 'Blog 2',
      author: 'Author 2',
      url: 'https://example.com/2',
      likes: 12
    },
    {
      _id: '3',
      title: 'Blog 3',
      author: 'Author 3',
      url: 'https://example.com/3',
      likes: 8
    }
  ]

  test('returns the blog with the most likes', () => {
    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, blogs[1])
  })
})

describe('most blogs', () => {
  const blogs = [
    {
      title: 'Blog 1',
      author: 'Robert C. Martin',
      url: 'https://example.com/1',
      likes: 5
    },
    {
      title: 'Blog 2',
      author: 'Edsger W. Dijkstra',
      url: 'https://example.com/2',
      likes: 10
    },
    {
      title: 'Blog 3',
      author: 'Robert C. Martin',
      url: 'https://example.com/3',
      likes: 7
    },
    {
      title: 'Blog 4',
      author: 'Robert C. Martin',
      url: 'https://example.com/4',
      likes: 3
    },
    {
      title: 'Blog 5',
      author: 'Edsger W. Dijkstra',
      url: 'https://example.com/5',
      likes: 8
    }
  ]

  test('returns the author with the most blogs', () => {
    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})

describe('most likes', () => {
  const blogs = [
    {
      title: 'Blog 1',
      author: 'Edsger W. Dijkstra',
      url: 'https://example.com/1',
      likes: 5
    },
    {
      title: 'Blog 2',
      author: 'Robert C. Martin',
      url: 'https://example.com/2',
      likes: 8
    },
    {
      title: 'Blog 3',
      author: 'Edsger W. Dijkstra',
      url: 'https://example.com/3',
      likes: 12
    },
    {
      title: 'Blog 4',
      author: 'Robert C. Martin',
      url: 'https://example.com/4',
      likes: 3
    }
  ]

  test('returns the author with the most likes', () => {
    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})