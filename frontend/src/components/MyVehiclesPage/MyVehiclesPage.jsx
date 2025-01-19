import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from "react-router-dom";
import { fetchUserVehicles, clearVehicles, deleteVehicle } from '../../store/vehicle';
import './MyVehicles.css';
import { useModal } from "../../context/Modal";
import { EditVehicleModal, NewVehicleModal } from "../VehicleModal";

function MyVehiclesPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const { vehicles, loading, error } = useSelector((state) => state.vehicle);
  const { setModalContent } = useModal();

  useEffect(() => {
    dispatch(fetchUserVehicles());

    return () => {
        dispatch(clearVehicles());
    }
  }, [dispatch]);

  // If not logged in redirect to homepage
  if (!sessionUser) return <Navigate to="/" replace={true} />;

  if (loading) {
    return ( 
      <div className="vehicle-list-container">
        <div className="vehicle-list">
          <h2 className="vehicle-list-title">My Vehicles</h2>
          <div className="vehicle-container">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="vehicles-list-container">Error: {error.message || 'Failed to load trips.'}</div>;
  }
  
  if (!vehicles) {
    return <div className="vehicles-list-container">No vehicles found.</div>;
  }

  const handleEditVehicle = (index) => {
    return async () => {
      setModalContent(<EditVehicleModal vehicleData={vehicles[index]} />)
    }
  }

  const handleDeleteVehicle = (id) => {
    return async () => {
      const response = await dispatch(deleteVehicle(id));

      if (response.ok) {
        dispatch(fetchUserVehicles());
      }
    }
  }

  const handleNewVehicle = async () => {
    setModalContent(<NewVehicleModal />)
  }

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-list">
        <h2 className="vehicle-list-title">My Vehicles</h2>
        <div className="vehicle-container">
          {vehicles.length === 0 ? (
            <div className="empty-list-container">
                <p className="empty-list-error-message">No Vehicles Found!</p>
            </div>
          ) : (
            <>
              {vehicles.map((vehicle, index) => {
                if (vehicle.type === 'gas') return (
                  <div className="vehicle-wrapper" key={vehicle.id}>
                    <div className="vehicle-details">
                      <span className="vehicle-name">{vehicle.name}</span>
                      <span className="vehicle-gas">
                        <div>
                          <b>Fuel Economy: </b> {vehicle.mpg} mpg
                        </div>
                        <div>
                          <b>Tank Capacity: </b> {vehicle.tankSize} gallons
                        </div>
                      </span>
                    </div>
                    <div className="vehicle-buttons-container">
                      <button className="vehicle-button" onClick={handleEditVehicle(index)}>Edit</button>
                      <button className="vehicle-button" onClick={handleDeleteVehicle(vehicle.id)}>Delete</button>
                    </div>
                  </div>
                )
                if (vehicle.type === 'electric') return (
                  <div className="vehicle-wrapper" key={vehicle.id}>
                    <div className="vehicle-details">
                      <span className="vehicle-name">{vehicle.name}</span>
                      <span><b>Max Charge Range: </b>{vehicle.range} miles</span>
                    </div>
                    <div className="vehicle-buttons-container">
                      <button className="vehicle-button" onClick={handleEditVehicle(index)}>Edit</button>
                      <button className="vehicle-button" onClick={handleDeleteVehicle(vehicle.id)}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
        <button className="new-vehicle-button" onClick={handleNewVehicle}>Add New Vehicle</button>
      </div>
    </div>
  );
}

export default MyVehiclesPage;