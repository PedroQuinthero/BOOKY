import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';

const client = new ApolloClient({
  uri: 'http://localhost:3001/graphql',
  cache: new InMemoryCache(),
});


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <h1 className='display-2'>Wrong page!</h1>,
    children: [
      {
        index: true,
        element: <SearchBooks />,
      },
      {
        path: '/saved',
        element: <SavedBooks />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <RouterProvider router={router} />
  </ApolloProvider>
);