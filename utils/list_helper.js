const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes
  }
}

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.reduce(reducer, 0)
}


const favoriteBlog = (blogs) => {
  const reducer = (prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  }
  return formatBlog(blogs.reduce(reducer))
}


const mostBlogs = (blogs) => {
  const reducer = (prev, current) => {
    return (prev.counts > current.counts) ? prev : current
  }
  let bloggers = []
  blogs.forEach((blog,ind) => {
    let bloggerFound = bloggers.find((blogger) => blog.author === blogger.author)
//    console.log(bloggerFound,bloggers)
    if (bloggerFound === undefined) {
      bloggers = bloggers.concat({ author: blog.author, blogs: 1})
    }
    else {
      bloggerFound.blogs++
    }
  })
  return bloggers.reduce(reducer)
}

const mostVotes = (blogs) => {
  const reducer = (prev, current) => {
    return (prev.votes > current.votes) ? prev : current
  }
  let bloggers = []
  blogs.forEach((blog,ind) => {
    let bloggerFound = bloggers.find((blogger) => blog.author === blogger.author)
//    console.log(bloggerFound,bloggers)
    if (bloggerFound === undefined) {
      bloggers = bloggers.concat({ author: blog.author, votes: blog.likes})
    }
    else {
      bloggerFound.votes = bloggerFound.votes + blog.likes
    }
  })
  return bloggers.reduce(reducer)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostVotes,
  formatBlog
}