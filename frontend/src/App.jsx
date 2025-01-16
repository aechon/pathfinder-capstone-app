import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import NewTripPage from './components/NewTripPage';
import TripDetailsPage from './components/TripDetailsPage/TripDetailsPage';
import MyTripsPage from './components/MyTripsPage/MyTripsPage';
import LandingPage from './components/LandingPage/LandingPage';

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
        element: <LandingPage />
      },
      {
        path: '/trips',
        element: <MyTripsPage />
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