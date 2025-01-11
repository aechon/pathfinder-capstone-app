import { useEffect, useState, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;
      
    const options = {
      fields: ["formatted_address", "geometry"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
      
    placeAutocomplete.addListener("place_changed", () => {
      onPlaceSelect({
        type: 'address',
        address: placeAutocomplete.getPlace().formatted_address,
        latitude: placeAutocomplete.getPlace().geometry.location.lat(),
        longitude: placeAutocomplete.getPlace().geometry.location.lng()
      });
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container">
      <input ref={inputRef} />
    </div>
  );
};

export default PlaceAutocomplete;