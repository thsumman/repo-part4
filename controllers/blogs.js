const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
//const { format, initialBlogs, nonExistingId, blogsInDb, usersInDb } = require('../tests/test_helper')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
/*const jwt = require('jsonwebtoken')*/
/*const listHelper = require('../utils/list_helper')
*/

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs.map(Blog.format))
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)

    if (blog) {
      response.json(Blog.format(blog))
    } else {
      response.status(404).end()
    }

  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

/*const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}*/

blogsRouter.post('/', async (request, response) => {
  try {
    /*const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)*/
    
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const body = request.body
    if (body.likes === undefined) {
      body.likes = 0
    }
    
    if ((body.title === undefined) & (body.url === undefined)) {
      return response.status(400).json({error: 'title and url missing'})
    }

    const user = await User.findById(decodedToken.id)

    //const user = await User.findById(request.body.user)

    /*const usersInDatabase = await usersInDb()
    const user = usersInDatabase[0]*/

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.json(Blog.format(savedBlog))

  } catch (exception) {
    console.log(exception)
    response.status(500).json({error: 'something went wrong...'})
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    if (!request.token) {
      return response.status(401).json({ error: 'token missing' })
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    if ( blog.user.toString() === decodedToken.id.toString() ) {
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    }
    else {
      response.status(403).json({error: 'not allowed to remove blog info of another user'})
    }

    
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(400).send({ error: 'malformatted id' })
    }
  }
})

/*blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)

    response.status(204).end()
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})*/

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  console.log(request.params.id)

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
    response.json(Blog.format(updatedBlog))
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'error in changing blog' })
  }
})

module.exports = blogsRouter