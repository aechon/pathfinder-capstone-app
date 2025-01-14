import { useModal } from "../../context/Modal";
import "./DetourOptions.css";

function DetourOptionsModal({ options = [], setNewDetour }) { 
  const { closeModal } = useModal();
  
  const selectDetour = (index) => {
    return () => {
      setNewDetour(options[index]);
      closeModal();
    }
  }

  return (
    <div className="detour-options-modal">
      <h2 className="detour-options-modal-title">Options</h2>
        <div className="detour-options-modal-container">
          {options.map((detour, index) => {
            return (
              <div className="detour-options-modal-options" key={index} onClick={selectDetour(index)}>
              <span className="detour-options-modal-name">Name: {detour.name}</span>
              <span className="detour-options-modal-details">
                <div className="detour-options-modal-detail">Price Level: {detour.price_level}</div>
                <div className="detour-options-modal-detail">Rating: {detour.rating}</div>
              </span>
            </div>
            )
          })}
        </div>
    </div>
  );
}

export default DetourOptionsModal;