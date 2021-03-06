import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { currentUser }) =>
  currentUser ? skip : new ForbiddenError('Not logged in.');

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { currentUser: { isAdmin } }) =>
    isAdmin ? skip : new ForbiddenError('Not authorized. I call shenanigans.')
);
