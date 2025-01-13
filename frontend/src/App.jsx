import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import NewTripPage from './components/NewTripPage';
import TripDetailsPage from './components/TripDetailsPage/TripDetailsPage';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <h1>Landing Page</h1>
      },
      {
        path: '/trips/new',
        element: <NewTripPage />
      },
      {
        path: '/trips/:tripId',
        element: <TripDetailsPage />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;