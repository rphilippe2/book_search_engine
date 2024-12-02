import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';

import cors from 'cors';
import db from './config/connection.js';
import routes from './routes/index.js'; // Optional: Keep if you want to retain REST routes temporarily
import { context } from './services/auth.js';
import { typeDefs, resolvers } from './schemas/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  try {
    await server.start();

    // Middleware for GraphQL
    app.use(
      '/graphql',
      cors(), // Enable cross-origin requests for the GraphQL endpoint
      bodyParser.json(),
      // @ts-ignore
      expressMiddleware(server, {
        context,
      })
    );

    // Parse request bodies
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')));
    }

    // Add REST routes (optional, for backward compatibility during transition)
    app.use(routes);

    // Connect to the database and start the server
    db.once('open', () => {
      
    });

    app.listen(PORT, () => {
        console.log(`🌍 Now listening on http://localhost:${PORT}`);
        console.log(`🚀 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
      });
  } catch (err) {
    console.error('Error starting Apollo Server:', err);
  }
}

startApolloServer();
