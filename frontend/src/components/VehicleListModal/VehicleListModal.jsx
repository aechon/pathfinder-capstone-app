import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import { fetchUserVehicles, clearVehicles } from "../../store/vehicle";
import "./VehicleList.css";

function VehicleListModal({ setVehicle }) { 
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const { vehicles } = useSelector((state) => state.vehicle);

  useEffect(() => {
      dispatch(fetchUserVehicles());
  
      return () => {
          dispatch(clearVehicles());
      }
    }, [dispatch]);

  const selectVehicle = (index) => {
    return () => {
      if (index === undefined) setVehicle(null);
      else setVehicle(vehicles[index]);
      closeModal();
    }
  }

  if (!vehicles) return (
    <div className="vehicle-options-modal">
      <h2 className="vehicle-options-modal-title">Vehicles</h2>
        Loading...
    </div>
  );

  return (
    <div className="vehicle-options-modal">
      <h2 className="vehicle-options-modal-title">Select Vehicle</h2>
        {vehicles.length === 0 ? (
          <div className="empty-list-container">
            <p className="empty-list-error-message">No Vehicles Found!</p>
          </div>
        ) : (
          <div className="vehicle-options-modal-container">
            {vehicles.map((vehicle, index) => {
              if (vehicle.type === 'gas') return (
                <span className="vehicle-options" key={vehicle.id} onClick={selectVehicle(index)}>
                  <div className="vehicle-option-name">{vehicle.name}</div>
                  <div className="vehicle-option-detail"><b>Fuel Economy:</b> {vehicle.mpg} mpg</div>
                </span>
              )
              if (vehicle.type === 'electric') return (
                <span className="vehicle-options" key={vehicle.id} onClick={selectVehicle(index)}>
                  <div className="vehicle-option-name">{vehicle.name}</div>
                  <div className="vehicle-option-detail"><b>Range:</b> {vehicle.range} miles</div>
                </span>
              )
            })}
            <div className="vehicle-options" onClick={selectVehicle()}>
              <span className="vehicle-options-none">None</span>
            </div>
          </div>
        )}
        
    </div>
  );
}

export default VehicleListModal;