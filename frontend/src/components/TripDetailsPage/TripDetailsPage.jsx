import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from "react-router-dom";
import { fetchTripDetails, clearTripDetails, createDetour } from '../../store/trip';
import { useParams } from 'react-router-dom';
import {
    Map,
    AdvancedMarker,
    Pin,
    useMap, 
    useMapsLibrary} from '@vis.gl/react-google-maps';
import { FaMapMarkerAlt } from "react-icons/fa";
import './TripDetails.css';
import { csrfFetch } from "../../store/csrf";
import { useModal } from "../../context/Modal";
import DetourOptionsModal from "../DetourListModal/DetourListModal";

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_BASIC_MAP_ID;
const DEFAULT_MAP_CENTER = [37.7900, -122.4009] //App Academy
const NEARBY_LOCATION_SEARCH_RADIUS = 5000;

function TripDetailsPage() {
  const { tripId } = useParams();
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const { tripDetails, loading, error } = useSelector((state) => state.trip);
  const { setModalContent } = useModal();
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const placesLibrary = useMapsLibrary("places");
  const [ directionsService, setDirectionsService ] = useState();
  const [ directionsRenderer, setDirectionsRenderer ] = useState();
  const [ placeService, setPlaceService] = useState();
  const [ route, setRoute ] = useState(null);
  const [ type, setType ] = useState("");
  const [ time, setTime ] = useState("");
  const [ waypoint, setWaypoint ] = useState({});
  const [ newDetour, setNewDetour ] = useState({});
  const [ disable, setDisable ] = useState(true);
  const [ errors, setErrors ] = useState({})

  useEffect(() => {
    dispatch(fetchTripDetails(tripId));

    return () => {
        dispatch(clearTripDetails());
    }
  }, [dispatch, tripId]);

  useEffect(() => {
    if (!routesLibrary || !placesLibrary || !map) return;

    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    setPlaceService(new placesLibrary.PlacesService(map));
  }, [routesLibrary, placesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !tripDetails) return;

    let data = {
        origin: {lat: tripDetails.startLat, lng: tripDetails.startLng},
        destination: tripDetails.endAddress
    }
    if (tripDetails.Detours.length > 0) {
        data.waypoints = tripDetails.Detours.map((detour) => {
            return {
                location: {
                    lat: detour.lat, lng: detour.lng
                },
                stopover: true
            }
        })
        data.optimizeWaypoints = true;
    }

    directionsService
      .route({
        ...data,
        travelMode: "DRIVING",
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoute(response);
      });
  }, [directionsService, directionsRenderer, tripDetails])

  useEffect(() => {
    if (!map) return;
    if (!route) return;
    
    map.fitBounds(route.routes[0].bounds);
  }, [map, route]);

  useEffect(() => {
    if (type === "" || !(time > 0) || !tripDetails) setDisable(true)
    else if (tripDetails.duration < time*60) setDisable(true)
    else setDisable(false);
  }, [type, time, tripDetails]);

  useEffect(() => {
    if (Object.keys(newDetour).length === 0 || Object.keys(waypoint).length === 0 || !tripDetails) return;

    // console.log(newDetour);
    let data = {
      tripId: tripId,
      name:  newDetour.name,
      type: type,
      lat: newDetour.geometry.location.lat(),
      lng: newDetour.geometry.location.lng(),
    };

    // Get route with detour
    let newRouteData = {
        origin: {lat: tripDetails.startLat, lng: tripDetails.startLng},
        destination: tripDetails.endAddress,
        optimizeWaypoints: true,
    };
    newRouteData.waypoints = tripDetails.Detours.map((detour) => {
        return {
            location: {
                lat: detour.lat, lng: detour.lng
            },
            stopover: true
        }
    });
    newRouteData.waypoints.push({
        location: {
            lat: data.lat, lng: data.lng
        },
        stopover: true
    });

    directionsService
      .route({
        ...newRouteData,
        travelMode: "DRIVING",
      })
      .then((response) => {
        // New route step data
        data.steps = [];
        response.routes[0].legs.forEach(leg => {
            const stepData = leg.steps.map(step => {
                const stepData = {
                  duration: step.duration.value,
                  startLat: step.start_point.lat(),
                  startLng: step.start_point.lng(),
                  endLat: step.end_point.lat(),
                  endLng: step.end_point.lng(),
                }
                if (stepData.duration > 300) {// Waypoint interval
                  const steps = Math.floor(stepData.duration / 300);
                  const interval = Math.floor(step.lat_lngs.length / steps);
                  stepData.lat_lngs = [];
                  for (let i = 1; i <= steps; i++) {
                    stepData.lat_lngs.push({
                      lat: step.lat_lngs[(i*interval)-1].lat(),
                      lng: step.lat_lngs[(i*interval)-1].lng()
                    })
                  }
                }
                return stepData;
            });
            data.steps = [...data.steps, ...stepData];;
        });

        // New route time and distance
        data.duration = 0;
        let distance = 0;
        for (let i = 0; i < response.routes[0].legs.length; i++) {
            data.duration += response.routes[0].legs[i].duration.value;
            distance += response.routes[0].legs[i].distance.value;
        }
        data.distance = `${Math.round(distance / 1609 * 10) / 10} mi`;

        // Add detour
        dispatch(createDetour(data));
      });

    // Reset data
    setType("");
    setTime("");
    setNewDetour({});
    setWaypoint({});
  }, [dispatch, newDetour, waypoint, tripDetails, tripId, type])

  // If not logged in redirect to homepage
  if (!sessionUser) return <Navigate to="/" replace={true} />;

  if (loading) {
    return <div className="trip-container">Loading...</div>;
  }

  if (error) {
    return <div className="trip-container">Error: {error.message || 'Failed to load trip details.'}</div>;
  }
  
  if (!tripDetails) {
    return <div className="trip-container">No trip details found.</div>;
  }

  // Opens modal to choose detour location
  const handleAddDetour = async () => {

    // fetch nearby waypoint
    await csrfFetch(`/api/trips/${tripId}/waypoint/${time*60}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then((res) => {
        return res.json();
      })
      .then((waypoint) => {
        // get places nearby based on waypoint
        setWaypoint(waypoint);
        placeService.nearbySearch({
            location: {lat: waypoint.lat, lng: waypoint.lng},
            radius: NEARBY_LOCATION_SEARCH_RADIUS,
            type: type
          }, (results) => {
            if (results.length === 0) setErrors({message: 'No establishments of this kind nearby!'});
            else setModalContent(<DetourOptionsModal options={results} setNewDetour={setNewDetour}/>); 
          }
        );
      })
      .catch((err) => {
        let errorData = {};
        if (err) errorData = err.json();
        return errorData;
      }).then((err) => {
        if (err) setErrors(err);
    });
  };

  // Adds detour location of type without user choosing
  const handleQuickAddDetour = async () => {
    console.log("new quick detour");
  };

//   console.log(tripDetails);
//   console.log(route);

  return (
    <div className="trip-container">
      <span className="trip-edit-container">
        <button className="trip-edit-dropdown">Edit</button>
      </span>
      <h2 className="trip-title">Trip Details</h2>
      <div className="trip-start-end-container">
        <span className='trip-label'>
            <FaMapMarkerAlt color='red' size='12'/> Start: <b className="trip-text">{tripDetails.startAddress}</b>
        </span>
        <span className='trip-label'>
            <FaMapMarkerAlt color='blue' size='12' /> Destination: <b className="trip-text">{tripDetails.endAddress}</b>
        </span>
        <span className="trip-span">
            <label className="trip-span-content">Duration: <b className="trip-text">{Math.floor(tripDetails.duration / 3600)} Hours, {Math.floor(tripDetails.duration % 3600 / 60)} Minutes</b></label>
            <label className="trip-label-content">Distance: <b className="trip-text">{tripDetails.distance}</b></label>
        </span>
      </div>
      

      <Map
        style={{width: '400px', height: '300px'}}
        defaultCenter={{lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1]}}
        defaultZoom={10}
        mapId={MAP_ID}
        disableDefaultUI={true}
      >
        <AdvancedMarker position={{lat: tripDetails.startLat, lng: tripDetails.startLng}}>
          <Pin
            background={'red'}
            borderColor={'coral'}
            glyphColor={'white'}
          />
        </AdvancedMarker>
        <AdvancedMarker position={{lat: tripDetails.endLat, lng: tripDetails.endLng}}>
          <Pin
            background={'blue'}
            borderColor={'lightblue'}
            glyphColor={'white'}
          />
        </AdvancedMarker>
      </Map>
      <h3 className="detour-title">Detour</h3>
      <span className="detour-container">
        <div className="detour-options-container">
          <span className="detour-input-span">
            <label className="detour-label">Type: </label>
            <select className="detour-type-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value=""></option>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="gas">Gas</option>
              <option value="lodging">Lodging</option>
            </select>
          </span>
          <span className="detour-input-span">
            <label className="detour-label">Time (Minutes): </label>
            <input className="detour-time-input"
              type='number'
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </span>
        </div>
        {tripDetails.Detours.length === 0 ? (
        <p className="error-message">No detour added yet.</p>
        ) : (
            <></>
            // <p>{tripDetails.Detours[0]}</p>
        )}
        {errors.message && <p className="error-message">{errors.message}</p>}
        <div className="detour-buttons-container">
          <button className='detour-button' onClick={handleAddDetour} disabled={disable}>Add Detour</button>
          <button className='detour-button' onClick={handleQuickAddDetour} disabled={disable}>Quick Add Detour</button>
        </div>
      </span>
    </div>
  );
}

export default TripDetailsPage;