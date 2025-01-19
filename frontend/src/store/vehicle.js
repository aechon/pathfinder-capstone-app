import { csrfFetch } from "./csrf";

const SET_VEHICLES = 'SET_VEHICLES';
const SET_VEHICLE_ERRORS = 'SET_VEHICLE_ERRORS';
const CLEAR_VEHICLES = 'CLEAR_VEHICLES';
const FETCH_VEHICLES_REQUEST = 'FETCH_VEHICLES_REQUEST';
const ADD_VEHICLE = 'ADD_VEHICLE';
const UPDATE_VEHICLE = 'UPDATE_VEHICLE';

// Action Creators
const setVehicles = (vehicles) => ({
  type: SET_VEHICLES,
  vehicles,
});

const setVehicleErrors = (errors) => ({
  type: SET_VEHICLE_ERRORS,
  errors,
});

const addVehicle = (vehicle) => ({
  type: ADD_VEHICLE,
  vehicle,
});

const updateVehicle = (vehicle) => ({
  type: UPDATE_VEHICLE,
  vehicle,
});

export const clearVehicles = () => ({
  type: CLEAR_VEHICLES,
});

// Action creators for fetching data
const fetchVehiclesRequest = () => ({
  type: FETCH_VEHICLES_REQUEST,
});

// Thunk Action Creators
export const fetchUserVehicles = () => async (dispatch) => {
  dispatch(fetchVehiclesRequest());
  try {
    const response = await csrfFetch('/api/vehicles/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const vehicles = await response.json();
      dispatch(setVehicles(vehicles));
    } else {
      const errorData = await response.json();
      dispatch(setVehicleErrors(errorData));
    }
  } catch (error) {
    console.error("Error fetching user's vehicles:", error);
    dispatch(setVehicleErrors({ server: 'An unexpected error occurred.' }));
  }
};

export const deleteVehicle = (id) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/vehicles/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      return response;
    } else {
      const errorData = await response.json();
      dispatch(setVehicleErrors(errorData));
    }
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    dispatch(setVehicleErrors({ server: 'An unexpected error occurred.' }));
  }
};

export const createVehicle = (data) => async (dispatch) => {
  const response = await csrfFetch('/api/vehicles/new', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const newVehicle = await response.json();
    dispatch(addVehicle(newVehicle));
    return null; 
  } else {
    const errorData = await response.json();
    dispatch(setVehicleErrors(errorData));
    return errorData; 
  }
}

export const editVehicle = (data, id) => async (dispatch) => {
  const response = await csrfFetch(`/api/vehicles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const updatedVehicle = await response.json();
    dispatch(updateVehicle(updatedVehicle));
    return null; 
  } else {
    const errorData = await response.json();
    dispatch(setVehicleErrors(errorData));
    return errorData; 
  }
}

// Initial state
const initialState = {
  vehicles: [],
  loading: false,
  errors: {}
};

// Reducer
const vehicleReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_VEHICLES:
      return {
        ...state,
        vehicles: action.vehicles,
        loading: false,
        errors: {}
      }
    case ADD_VEHICLE:
      return {
        ...state,
        vehicles: [...state.vehicles, action.vehicle],
        loading: false,
        errors: {}
      }
    case UPDATE_VEHICLE:
      return {
        ...state,
        vehicles: state.vehicles.map((vehicle) => {
          if (vehicle.id === action.vehicle.id) return action.vehicle;
          else return vehicle;
        }),
        loading: false,
        errors: {}
      }
    case SET_VEHICLE_ERRORS:
      return {
        ...state,
        loading: false,
        errors: action.errors
      }
    case FETCH_VEHICLES_REQUEST:
      return {
        ...state,
        loading: true,
        errors: {}
      }
    default: {
      return {
        ...state
      }
    }
  }
};

export default vehicleReducer;