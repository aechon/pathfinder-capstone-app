import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./VehicleModal.css";
import { editVehicle } from "../../store/vehicle";

function EditVehicleModal({ vehicleData }) { 
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [vehicle, setVehicle] = useState(vehicleData.name);
  const [type, setType] = useState(vehicleData.type);
  const [range, setRange] = useState(vehicleData.range ? vehicleData.range : '');
  const [mpg, setMpg] = useState(vehicleData.mpg ? vehicleData.mpg : '');
  const [tankSize, setTankSize] = useState(vehicleData.tankSize ? vehicleData.tankSize : '');
  const [disable, setDisable] = useState(true);
  const { closeModal } = useModal();

  useEffect(() => {
    if (type === 'electric') {
        if (vehicle.length > 0 && range > 0) setDisable(false);
        else setDisable(true);
    }
    if (type === 'gas') {
        if (vehicle.length > 0 && mpg > 0 && tankSize > 0) setDisable(false);
        else setDisable(true);
    }
  }, [vehicle, range, mpg, tankSize, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let data = {
        name: vehicle,
        type: type,
    };
    if (type === 'electric') {
        data.range = range;
    }
    if (type === 'gas') {
        data.mpg = mpg;
        data.tankSize = tankSize;
    }

    const serverResponse = await dispatch(editVehicle(data, vehicleData.id));

    if (serverResponse) {
      // If there's an error from the server, set the errors
      setErrors(serverResponse);
    } else {
      closeModal(); // Close the modal
    }  
  };

  return (
    <div className="vehicle-modal">
      <h2 className="vehicle-modal-title">Edit Vehicle</h2>
      <form className="vehicle-modal-form" onSubmit={handleSubmit}>
        <label className="vehicle-modal-label">
          Vehicle Name:
          <input
            className="vehicle-modal-input"
            type="text"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            required
          />
        </label>
        <label className="vehicle-modal-label">
          Type:
          <select 
            className="vehicle-modal-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="electric">Electric</option>
            <option value="gas">Gas</option>
          </select>
        </label>
        {type === 'electric' ? (
          <label className="vehicle-modal-label">
          Maximum Range (Miles):
          <input
            className="vehicle-modal-number-input"
            type='number'
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />
          </label>
        ) : (
          <>
            <label className="vehicle-modal-label">
              Fuel Economy (mpg):
              <input
                className="vehicle-modal-number-input"
                type='number'
                value={mpg}
                onChange={(e) => setMpg(e.target.value)}
              />
            </label>
            <label className="vehicle-modal-label">
              Tank Capacity (gallons):
              <input
                className="vehicle-modal-number-input"
                type='number'
                value={tankSize}
                onChange={(e) => setTankSize(e.target.value)}
              />
            </label>
          </>
        )}
        {errors.message && <p className="error-message">{errors.message}</p>}
        <button className="vehicle-modal-button" type="submit" disabled={disable}>Update Vehicle</button>
      </form>
    </div>
  );
}

export default EditVehicleModal;