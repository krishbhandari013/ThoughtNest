// client/src/data/blog.js
import logo from './logo.png';
import unknown from './unknown.jpg';
import unknown2 from './unknown2.jpg';

export const Logo = logo;


export const blogPosts = [
  {
    id: 1,
    title: "Getting Started with React Hooks",
    img : unknown,
    writer: {
      id: 1,
      name: "John Doe"
    },
    date: "2024-03-15",
    likes: 342,
    comments: 28,
    shares: 45,
    content: "React Hooks revolutionized how we write React components. In this guide, we'll explore useState, useEffect, and custom hooks. Learn how to manage state and side effects in functional components with practical examples and best practices."
  },
  {
    id: 2,
    title: "Mastering JavaScript Async/Await",
    img: unknown2,
    writer: {
      id: 2,
      name: "Jane Smith"
    },
    date: "2024-03-12",
    likes: 256,
    comments: 19,
    shares: 32,
    content: "Async/await makes asynchronous code look synchronous. Learn how to handle promises elegantly, avoid callback hell, and write cleaner JavaScript code. Includes error handling and parallel execution patterns."
  },
  {
    id: 3,
    title: "Building RESTful APIs with Node.js",
    img: unknown,
    writer: {
      id: 3,
      name: "Mike Johnson"
    },
    date: "2024-03-10",
    likes: 298,
    comments: 32,
    shares: 41,
    content: "Step-by-step guide to creating robust REST APIs using Node.js, Express, and MongoDB. Learn CRUD operations, authentication, and best practices for building scalable backend services."
  },
  {
    id: 4,
    title: "CSS Grid vs Flexbox: Which to Use?",
    img: unknown2,
    writer: {
      id: 2,
      name: "Jane Smith"
    },
    date: "2024-03-08",
    likes: 189,
    comments: 15,
    shares: 23,
    content: "Understanding the differences between CSS Grid and Flexbox. Learn when to use each layout system with practical examples. Perfect for building responsive and modern web layouts."
  },
  {
    id: 5,
    title: "Introduction to Machine Learning",
    img: unknown,
    writer: {
      id: 4,
      name: "Sarah Wilson"
    },
    date: "2024-03-05",
    likes: 478,
    comments: 42,
    shares: 89,
    content: "Beginner's guide to machine learning concepts and implementation. Covers supervised learning, unsupervised learning, and practical examples using Python libraries like scikit-learn."
  },
  {
    id: 6,
    title: "10 Tips for Landing Your First Dev Job",
    img: unknown2,
    writer: {
      id: 1,
      name: "John Doe"
    },
    date: "2024-03-01",
    likes: 567,
    comments: 89,
    shares: 234,
    content: "Practical advice for junior developers breaking into tech. Learn how to build a portfolio, network effectively, ace interviews, and stand out in the competitive job market."
  },
  {
    id: 7,
    title: "Understanding React Server Components",
    img: unknown,
    writer: {
      id: 1,
      name: "John Doe"
    },
    date: "2024-02-28",
    likes: 134,
    comments: 12,
    shares: 18,
    content: "Deep dive into React Server Components and how they're changing React development. Learn about the benefits, implementation patterns, and when to use server vs client components."
  },
  {
    id: 8,
    title: "Docker for Beginners",
    img: unknown2,
    writer: {
      id: 5,
      name: "Alex Chen"
    },
    date: "2024-02-25",
    likes: 223,
    comments: 27,
    shares: 34,
    content: "Learn Docker fundamentals and containerization with hands-on examples. Covers Dockerfiles, containers, images, and Docker Compose for modern development workflows."
  },
  {
    id: 9,
    title: "TypeScript Best Practices",
    img: unknown,
    writer: {
      id: 3,
      name: "Mike Johnson"
    },
    date: "2024-02-22",
    likes: 312,
    comments: 34,
    shares: 56,
    content: "Master TypeScript with these best practices. Learn about type safety, interfaces, generics, and how to write more maintainable JavaScript code."
  },
  {
    id: 10,
    title: "Tailwind CSS Tutorial",
    img: unknown,
    writer: {
      id: 2,
      name: "Jane Smith"
    },
    date: "2024-02-20",
    likes: 287,
    comments: 31,
    shares: 42,
    content: "Complete guide to Tailwind CSS - the utility-first CSS framework. Learn how to build modern, responsive websites faster with this comprehensive tutorial."
  },
  {
    id: 11,
    title: "GraphQL vs REST",
    img: unknown,
    writer: {
      id: 4,
      name: "Sarah Wilson"
    },
    date: "2024-02-18",
    likes: 345,
    comments: 38,
    shares: 67,
    content: "Comparing GraphQL and REST APIs. Learn the pros and cons of each approach, use cases, and when to choose one over the other for your projects."
  },
  {
    id: 12,
    title: "Next.js 14 Features",
    img: unknown,
    writer: {
      id: 1,
      name: "John Doe"
    },
    date: "2024-02-15",
    likes: 456,
    comments: 51,
    shares: 78,
    content: "Explore the latest features in Next.js 14 including server actions, partial prerendering, and improved performance. Build better React applications."
  }
];


