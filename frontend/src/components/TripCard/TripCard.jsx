import { useEffect, useState } from 'react';
import {
    Map,
    AdvancedMarker,
    Pin,
    useMap, 
    useMapsLibrary,
    } from '@vis.gl/react-google-maps';
import { FaMapMarkerAlt } from "react-icons/fa";
import './TripCard.css';

function TripCard({ trip, mapId, id }) {
  const map = useMap(`map${id}`);
  const routesLibrary = useMapsLibrary("routes");
  const [ directionsService, setDirectionsService ] = useState();
  const [ directionsRenderer, setDirectionsRenderer ] = useState();

  useEffect(() => {
    if (!routesLibrary || !map) return;

    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);      
  
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !trip) return;

    let data = {
        destination: trip.endAddress
    }
    if (trip.startAddress === "User's Location") data.origin = {lat: trip.startLat, lng: trip.startLng};
    else data.origin = trip.startAddress;
    if (trip.Detours.length > 0) {
        data.waypoints = trip.Detours.map((detour) => {
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
      });
  }, [directionsService, directionsRenderer, trip]);

  if (!trip) {
    return <div className="trips-list-container">Loading...</div>;
  }

  return (
    <div className='trip-card'>
      <div className="trip-start-end-container">
        <span className='trip-label trip-card-label'>
          <FaMapMarkerAlt color='red' size='12'/> Start: <b className="trip-text">{trip.startAddress}</b>
        </span>
        <span className='trip-label trip-card-label'>
          <FaMapMarkerAlt color='blue' size='12' /> Destination: <b className="trip-text">{trip.endAddress}</b>
        </span>
        <span className="trip-span">
          <label className="trip-span-content">Duration: <b className="trip-text">{Math.floor(trip.duration / 3600)} Hours, {Math.floor(trip.duration % 3600 / 60)} Minutes</b></label>
          <label className="trip-label-content">Distance: <b className="trip-text">{trip.distance}</b></label>
        </span>
      </div>
      <Map
        id={`map${id}`}
        style={{width: '400px', height: '300px'}}
        defaultCenter={{lat: trip.endLat - (trip.endLat-trip.startLat)/2, lng: trip.endLng -(trip.endLng-trip.startLng)/2}}
        defaultZoom={10}
        mapId={mapId}
        disableDefaultUI={true}
        gestureHandling={'none'}
        >
        <AdvancedMarker position={{lat: trip.startLat, lng: trip.startLng}}>
          <Pin
            background={'red'}
            borderColor={'coral'}
            glyphColor={'white'}
          />
        </AdvancedMarker>
        <AdvancedMarker position={{lat: trip.endLat, lng: trip.endLng}}>
          <Pin
            background={'blue'}
            borderColor={'lightblue'}
            glyphColor={'white'}
          />
        </AdvancedMarker>
      </Map>
    </div>
  )
}

export default TripCard;