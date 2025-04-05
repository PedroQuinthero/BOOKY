import { AuthenticationError } from 'apollo-server-express';
import { signToken } from '../services/auth.js';
import User from '../models/User.js';

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: { user: { _id: any } }) => {
      if (!context.user) throw new AuthenticationError('Not logged in');
      return await User.findById(context.user._id);
    },
    searchBooks: async (_parent: any, { query }: { query: string }) => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
      if (!response.ok) {
        console.error('Google Books API error:', await response.text());
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      return data.items.map((item: any) => ({
        bookId: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || [],
        description: item.volumeInfo.description || '',
        image: item.volumeInfo.imageLinks?.thumbnail || '',
        link: item.volumeInfo.infoLink || '',
      }));
      }
      catch (err) {
        console.log(err)
        throw new Error('Failed to fetch books');
      }
    },
  },

  Mutation: {
    login: async (_parent: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Invalid credentials');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    addUser: async (_parent: any, args: any) => {
      const user = await User.create(args);
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    saveBook: async (_parent: any, { bookData }: any, context: { user: { _id: any } }) => {
      if (!context.user) throw new AuthenticationError('Not logged in');
      return await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true }
      );
    },

    removeBook: async (_parent: any, { bookId }: any, context: { user: { _id: any } }) => {
      if (!context.user) throw new AuthenticationError('Not logged in');
      return await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};

export default resolvers;