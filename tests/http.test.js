const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, format, nonExistingId, blogsInDb } = require('./test_helper')

describe('when there is initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(b => new Blog(b))
    await Promise.all(blogObjects.map(b => b.save()))
  })
  test('all blogs are returned as json by GET /api/blogs', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedTitles = response.body.map(b => b.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedTitles).toContain(blog.title)
    })
  })
  test('individual blogs are returned as json by GET /api/blogs/:id', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]
    const response = await api
      .get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(response.body.title).toBe(aBlog.title)
  })
  test('404 returned by GET /api/blogs/:id with nonexisting valid id', async () => {
    const validNonexistingId = await nonExistingId()

    const response = await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })
  test('400 is returned by GET /api/blogs/:id with invalid id', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    const response = await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new blog', async () => {

  test('POST /api/blogs succeeds with valid data', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
      title: 'testiTitleAgain',
      author: 'uusiAuthor2',
      url: 'www.ksml.fi',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

    const titles = blogsAfterOperation.map(r => r.title)
    expect(titles).toContain('testiTitleAgain')
  })

  test('blog without title and url returns status code 400', async () => {
    const newBlog = {
      author: 'uusiAuthor2',
      likes: 1
    }

    const blogsAtStart = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfterOperation = await blogsInDb()

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
  })

  test('blog without likes is added with value 0', async () => {
    const newBlog = {
      title: 'testiTitleTaas100',
      author: 'uusiAuthor2',
      url: 'www.ksml.fi'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)

    const response = await api
      .get('/api/blogs')
    const blogAdded = await response.body.find(blog => blog.title === 'testiTitleTaas100')
    expect(blogAdded.likes).toBe(0)
  })
})

describe('deletion of a blog', async () => {
  let addedBlog

  beforeAll(async () => {
    addedBlog = new Blog({
      title: 'testiTitleAgain2',
      author: 'uusiAuthor2',
      url: 'www.ksml.fi',
      likes: 1
    })
    await addedBlog.save()
  })

  test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsAtStart = await blogsInDb()

    await api
      .delete(`/api/blogs/${addedBlog._id}`)
      .expect(204)

    const blogsAfterOperation = await blogsInDb()

    const titles = blogsAfterOperation.map(r => r.title)

    expect(titles).not.toContain(addedBlog.title)
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
  })
})

describe('update of a blog', async () => {
  let newInfoBlog

  beforeAll(async () => {
    newInfoBlog = new Blog({
      title: 'testiTitleAgain2B',
      author: 'uusiAuthor2B',
      url: 'www.helsinki.fi',
      likes: 100
    })
  })

  test('PUT /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsInDatab = await blogsInDb()
    const aBlog = blogsInDatab[0]
    console.log(aBlog,aBlog.id)
    
    await api
      .put(`/api/blogs/${aBlog.id}`)
      .send(newInfoBlog)
      .expect(200)

    const blogsAfterOperation = await blogsInDb()

    const titles = blogsAfterOperation.map(r => r.title)
    const authors = blogsAfterOperation.map(r => r.author)
    const urls = blogsAfterOperation.map(r => r.url)
    const likes = blogsAfterOperation.map(r => r.likes)

    expect(titles).toContain(newInfoBlog.title)
    expect(authors).toContain(newInfoBlog.author)
    expect(urls).toContain(newInfoBlog.url)
    expect(likes).toContain(newInfoBlog.likes)
    expect(blogsAfterOperation.length).toBe(blogsInDatab.length)
  })
})

afterAll(() => {
  server.close()
})