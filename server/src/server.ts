import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './services/auth.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI!)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authenticateToken(req),
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({
    app: app as any,
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Serve static files from client/dist (Vite)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });

  app.listen(PORT, () =>
    console.log(`🌍 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  );
};

startServer();