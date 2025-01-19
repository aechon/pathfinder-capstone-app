import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, NavLink } from "react-router-dom";
import { fetchUserTrips, clearTrips, deleteTrip } from '../../store/trip';
import './MyTrips.css';
import TripCard from "../TripCard";
// import { useModal } from "../../context/Modal";


const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_BASIC_MAP_ID;

function MyTripsPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const { trips, loading, error } = useSelector((state) => state.trip);
//   const { setModalContent } = useModal();
//   const [ errors, setErrors ] = useState({});

  useEffect(() => {
    dispatch(fetchUserTrips());

    return () => {
        dispatch(clearTrips());
    }
  }, [dispatch]);

  // If not logged in redirect to homepage
  if (!sessionUser) return <Navigate to="/" replace={true} />;

  if (loading) {
    return ( 
      <div className="trips-list-container">
        <div className="trips-list">
          <h2 className="trips-list-title">My Trips</h2>
          <div className="trip-cards-container">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="trips-list-container">Error: {error.message || 'Failed to load trips.'}</div>;
  }
  
  if (!trips) {
    return <div className="trips-list-container">No trip details found.</div>;
  }

  const handleDeleteTrip = (id) => {
    return async () => {
      const response = await dispatch(deleteTrip(id));

      if (response.ok) {
        dispatch(fetchUserTrips());
      }
    }
  }

  return (
    <div className="trips-list-container">
      <div className="trips-list">
      <h2 className="trips-list-title">My Trips</h2>
      <div className="trip-cards-container">
        {trips.length === 0 ? (
            <div className="empty-list-container">
                <p className="empty-list-error-message">No Trips Found!</p>
                <NavLink to='/trips/new'>
                  <button className="add-trip-button">Add new trip</button>
                </NavLink>
            </div>
        ) : (
          <>
            {trips.map((trip) => {
              return (
                <div className="trip-card-wrapper" key={trip.id}>
                  <NavLink to={`/trips/${trip.id}`} style={{textDecoration: 'none'}}>
                    <TripCard trip={trip} mapId={MAP_ID} id={trip.id} />
                  </NavLink>
                  <button className="trip-delete-button" onClick={handleDeleteTrip(trip.id)}>Delete</button>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
    </div>
    
  );
}

export default MyTripsPage;