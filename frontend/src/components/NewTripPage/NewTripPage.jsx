import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap, 
  useMapsLibrary} from '@vis.gl/react-google-maps';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { PlaceAutocomplete } from "../GoogleMaps";
import './NewTrip.css';
import { csrfFetch } from "../../store/csrf";

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_BASIC_MAP_ID;
const DEFAULT_MAP_CENTER = [37.7900, -122.4009] //App Academy

function NewTripPage() {    
    const [ start, setStart ] = useState('');
    const [ startData, setStartData ] = useState({type: ''});
    const [ end, setEnd ] = useState('');
    const [ endData, setEndData ] = useState({type: ''});
    const [ disable, setDisable ] = useState(true);
    const routesLibrary = useMapsLibrary("routes");
    const [ directionsService, setDirectionsService ] = useState();
    const [ directionsRenderer, setDirectionsRenderer ] = useState();
    const [ route, setRoute ] = useState(null);
    const [ errors, setErrors ] = useState({})
    const map = useMap();
    const navigate = useNavigate();

    useEffect(() => {
      if (!routesLibrary || !map) return;

      setDirectionsService(new routesLibrary.DirectionsService());
      setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, [routesLibrary, map]);

    useEffect(() => {
      if (startData.type === 'address') setStart(startData.address);
      if (startData.type === 'coords') setStart(startData.latitude + ', ' + startData.longitude);
    }, [startData]);

    useEffect(() => {
      if (endData.type === 'address') setEnd(endData.address);
      if (endData.type === 'coords') setEnd(endData.latitude + ', ' + endData.longitude);
    }, [endData])

    useEffect(() => {
      if (!directionsService || !directionsRenderer || !start || !end) return;

      let origin;
      if (startData.type === 'address') origin = startData.address;
      else origin = {lat: startData.latitude, lng: startData.longitude};

      let destination;
      if (endData.type === 'address') destination = endData.address;
      else destination = {lat: endData.latitude, lng: endData.longitude};
      
      directionsService
        .route({
          origin: origin,
          destination: destination,
          travelMode: "DRIVING",
        })
        .then((response) => {
          directionsRenderer.setDirections(response);
          setRoute(response);
        });
    }, [directionsService, directionsRenderer, start, end, startData, endData])

    useEffect(() => {
      if (!route) {
        setDisable(true);
      } else {
        setDisable(false);
      }
    }, [route]);

    useEffect(() => {
      if (!map) return;

      if (start && !end) map.setCenter({lat: startData.latitude, lng: startData.longitude});
      if (!start && end) map.setCenter({lat: endData.latitude, lng: endData.longitude});

      if (start && end && route) {
        map.setCenter({lat: (startData.latitude+endData.latitude)/2, lng: (startData.longitude+endData.longitude)/2});
        map.fitBounds(route.routes[0].bounds);
      } 
    }, [map, start, end, startData, endData, route]);

    const handleGetUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        console.log("Geolocation not supported");
      }
      
      function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setStartData({type: 'coords', latitude: latitude, longitude: longitude});
      }
      
      function error() {
        console.log("Unable to retrieve your location");
      }
    }

    const handleDemoLocationStart = () => {
        setStartData({type: 'address',
          address: '548 Market St Suite 96590, San Francisco, CA 94104, USA',
          latitude: 37.7900,
          longitude: -122.4009
        });
    }

    const handleDemoLocationEnd = () => {
      setEndData({type: 'address',
        address: 'Lake Tahoe, United States',
        latitude: 39.0968,
        longitude: -120.0324
      });
    }

    const handleSubmit = async (e) => {
      e.preventDefault();

      // format trip data
      const data = {
        startLat: startData.latitude,
        startLng: startData.longitude,
        endLat: endData.latitude,
        endLng: endData.longitude,
        duration: route.routes[0].legs[0].duration.value,
        distance: route.routes[0].legs[0].distance.text
      };
      if (startData.type === 'coords') data.startAddress = "User's Location";
      else data.startAddress = startData.address;
      if (endData.type === 'coords') data.endAddress = "User's Location";
      else data.endAddress = endData.address;

      data.steps = route.routes[0].legs[0].steps.map(step => {
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
              lat: step.lat_lngs[i*interval].lat(),
              lng: step.lat_lngs[i*interval].lng()
            })
          }
        }
        return stepData;
      });

      // New trip action
      await csrfFetch('/api/trips/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(() => {
        navigate('/success');
        return;
      })
      .catch((err) => {
        const errorData = {};
        if (err) errorData = err.json();
        return errorData;
      }).then((err) => {
        if (err) setErrors(err);
      });
    };

  return (
    <div className="new-trip-container">
      <form className="new-trip-form" onSubmit={handleSubmit}>
        <h2 className="new-trip-title">Add New Trip</h2>

        <label className='new-trip-label'>Select a starting location.</label>
          <div className="new-trip-input-container">
            <div className="new-trip-autocomplete">
              <PlaceAutocomplete onPlaceSelect={setStartData} />
            </div>
            <span className="new-trip-defaults">
              <button type='button' onClick={handleGetUserLocation}>Use User location</button>
              <button type='button' onClick={handleDemoLocationStart}>Demo Start Location (App Academy)</button>
            </span>
          </div>

          <label className='new-trip-label'>Select a destination.</label>
          <div className="new-trip-input-container">
            <div className="new-trip-autocomplete">
              <PlaceAutocomplete onPlaceSelect={setEndData} />
            </div>
            <button type='button' onClick={handleDemoLocationEnd}>Demo Destination (Lake Tahoe)</button>
          </div>
              
          <label className='new-trip-label'>
            <FaMapMarkerAlt color='red' size='12'/> Start: <b className="new-trip-text">{start}</b>
          </label>
          <label className='new-trip-label'>
            <FaMapMarkerAlt color='blue' size='12' /> Destination: <b className="new-trip-text">{end}</b>
          </label>

          <Map
            style={{width: '400px', height: '200px'}}
            defaultCenter={{lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1]}}
            defaultZoom={10}
            mapId={MAP_ID}
            disableDefaultUI={true}
          >
            {start ? (
              <AdvancedMarker position={{lat: startData.latitude, lng: startData.longitude}}>
                <Pin
                  background={'red'}
                  borderColor={'coral'}
                  glyphColor={'white'}
                />
              </AdvancedMarker>
            ) : (
              <>
              </>
            )}
            {end ? (
              <AdvancedMarker position={{lat: endData.latitude, lng: endData.longitude}}>
                <Pin
                  background={'blue'}
                  borderColor={'lightblue'}
                  glyphColor={'white'}
                />
              </AdvancedMarker>
            ) : (
              <>
              </>
            )}
          </Map>
        {errors.message && <p className="error-message">{errors.message}</p>} 
        <button className='new-trip-button' type='submit' disabled={disable}>Add Trip</button>   
      </form>
    </div>
  );
}

export default NewTripPage;