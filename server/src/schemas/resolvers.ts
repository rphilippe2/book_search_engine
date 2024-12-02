import { AuthenticationError } from 'apollo-server-errors';
import User, { UserDocument } from '../models/User.js'; // Adjust the import based on your file structure
import { signToken } from '../services/auth.js';
import { BookDocument } from '../models/Book'; // Assuming you have a Book model, adjust if needed
export interface IContext {
  user: UserDocument;
}
const resolvers = {
  Query: {
    me: async (_parent: undefined, _args: undefined, context: IContext): Promise<UserDocument | null> => {
      if (context.user) {
        return await User.findById(context.user._id).populate('savedBooks');
      }
      throw new AuthenticationError('Not logged in');
    },
  },

  Mutation: {
    login: async (_parent: undefined, { email, password }: { email: string; password: string }): Promise<{ token: string; user: UserDocument }> => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Incorrect email or password');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect email or password');
      }
        // @ts-ignore
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    addUser: async (_parent: undefined, { username, email, password }: { username: string; email: string; password: string }): Promise<{ token: string; user: UserDocument }> => {
      const user = await User.create({ username, email, password });
        // @ts-ignore
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    saveBook: async (_parent: undefined, { book }: { book: BookDocument }, context: IContext): Promise<UserDocument> => {
      if (context.user) {
        // @ts-ignore
        return await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError('You need to be logged in');
    },

    removeBook: async (_parent: undefined, { bookId }: { bookId: string }, context: IContext): Promise<UserDocument> => {
      if (context.user) {
        // @ts-ignore
        return await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in');
    },
  },
};

export default resolvers;
