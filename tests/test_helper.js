const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    'title': 'testiTitle',
    'author': 'minaAuthor',
    'url': 'http://www.fmi.fi',
    'likes': 0
  },
  {
    'title': 'testiTitle2',
    'author': 'minaAuthor2',
    'url': 'http://www.yle.fi',
    'likes': 0
  }
]

const format = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog._id
  }
}

const nonExistingId = async () => {
  const blog = new Blog()
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(format)
}

const usersInDb = async () => {
  const users = await User.find({})
  return users
}

module.exports = {
  initialBlogs, format, nonExistingId, blogsInDb, usersInDb
}

