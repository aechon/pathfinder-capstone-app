import { csrfFetch } from "./csrf";

const SET_TRIP_DETAILS = 'SET_TRIP_DETAILS';
const SET_TRIP_ERRORS = 'SET_TRIP_ERRORS';
const CLEAR_TRIP_DETAILS = 'CLEAR_TRIP_DETAILS';
const FETCH_TRIPS_REQUEST = 'FETCH_TRIPS_REQUEST';

// Action Creators
const setTripDetails = (trip) => ({
  type: SET_TRIP_DETAILS,
  trip,
});

const setTripErrors = (errors) => ({
  type: SET_TRIP_ERRORS,
  errors,
});

export const clearTripDetails = () => ({
  type: CLEAR_TRIP_DETAILS,
});

// Action creators for fetching data
const fetchTripsRequest = () => ({
  type: FETCH_TRIPS_REQUEST,
});

// Thunk Action Creators
export const fetchTripDetails = (tripId) => async (dispatch) => {
  dispatch(fetchTripsRequest());
  try {
    const response = await csrfFetch(`/api/trips/${tripId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const trip = await response.json();
      dispatch(setTripDetails(trip));
    } else {
      const errorData = await response.json();
      dispatch(setTripErrors(errorData));
    }
  } catch (error) {
    console.error('Error fetching trip details:', error);
    dispatch(setTripErrors({ server: 'An unexpected error occurred.' }));
  }
};

// Initial state
const initialState = {
  tripDetails: null,
  loading: false,
  errors: {}
};

// Reducer
const tripReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TRIP_DETAILS:
      return {
        ...state,
        tripDetails: action.trip,
        loading: false,
        errors: {}
      }
    case SET_TRIP_ERRORS:
      return {
        ...state,
        loading: false,
        errors: action.errors
      }
    case FETCH_TRIPS_REQUEST:
      return {
        ...state,
        loading: true,
        errors: {}
      }
    case CLEAR_TRIP_DETAILS:
      return {
        ...state,
        tripDetails: null,
        loading: false,
        errors: {}
      }
    default: {
      return {
        ...state
      }
    }
  }
};

export default tripReducer;