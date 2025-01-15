import { useModal } from "../../context/Modal";
import "./EditEndpoint.css";
import { PlaceAutocomplete } from "../GoogleMaps";
import { useEffect, useState } from "react";

function EditEndpointModal({ setEndpoint }) { 
  const { closeModal } = useModal();
  const [ selectedEndpoint, setSelectedEndpoint ] = useState({});
  const [ disable, setDisable ] = useState(true);
  
  useEffect (() => {
    if (Object.keys(selectedEndpoint).length === 0) setDisable(true);
    else setDisable(false);
  }, [selectedEndpoint]);

  const selectEndpoint = () => {
    setEndpoint(selectedEndpoint);
    closeModal();
  };

  return (
    <div className="edit-endpoint-modal">
      <h3 className="edit-endpoint-modal-title">New Endpoint</h3>
      <div className="edit-endpoint-modal-container">
          <PlaceAutocomplete onPlaceSelect={setSelectedEndpoint} />
          <button 
            className="edit-endpoint-button" 
            onClick={selectEndpoint}
            disabled={disable}>
              Update
            </button>
      </div>
    </div>
  );
}

export default EditEndpointModal;