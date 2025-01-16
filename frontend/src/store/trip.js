import { csrfFetch } from "./csrf";

const SET_TRIP_DETAILS = 'SET_TRIP_DETAILS';
const SET_TRIP_ERRORS = 'SET_TRIP_ERRORS';
const CLEAR_TRIP_DETAILS = 'CLEAR_TRIP_DETAILS';
const FETCH_TRIPS_REQUEST = 'FETCH_TRIPS_REQUEST';
const SET_TRIPS = 'SET_TRIPS';
const CLEAR_TRIPS = 'CLEAR_TRIPS';

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

const setTrips = (trips) => ({
  type: SET_TRIPS,
  trips,
});

export const clearTrips = () => ({
  type: CLEAR_TRIPS,
});

// Action creators for fetching data
const fetchTripsRequest = () => ({
  type: FETCH_TRIPS_REQUEST,
});

// Thunk Action Creators
export const fetchUserTrips = () => async (dispatch) => {
  dispatch(fetchTripsRequest());
  try {
    const response = await csrfFetch('/api/trips/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const trips = await response.json();
      dispatch(setTrips(trips));
    } else {
      const errorData = await response.json();
      dispatch(setTripErrors(errorData));
    }
  } catch (error) {
    console.error("Error fetching user's trips:", error);
    dispatch(setTripErrors({ server: 'An unexpected error occurred.' }));
  }
};

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

export const createDetour = (data) => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/detours/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const trip = await response.json();
      dispatch(setTripDetails(trip));
    } else {
      const errorData = await response.json();
      dispatch(setTripErrors(errorData));
    }
  } catch (error) {
    console.error('Error adding detour:', error);
    dispatch(setTripErrors({ server: 'An unexpected error occurred.' }));
  }
};

export const editEndpoint = (data) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/trips/${data.tripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const trip = await response.json();
      dispatch(setTripDetails(trip));
    } else {
      const errorData = await response.json();
      dispatch(setTripErrors(errorData));
    }
  } catch (error) {
    console.error('Error editing endpoint:', error);
    dispatch(setTripErrors({ server: 'An unexpected error occurred.' }));
  }
};

export const deleteDetour = (data) => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/detours/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const trip = await response.json();
      dispatch(setTripDetails(trip));
    } else {
      const errorData = await response.json();
      dispatch(setTripErrors(errorData));
    }
  } catch (error) {
    console.error('Error removing detour:', error);
    dispatch(setTripErrors({ server: 'An unexpected error occurred.' }));
  }
};

export const deleteTrip = (id) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/trips/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      return response;
    } else {
      const errorData = await response.json();
      dispatch(setTripErrors(errorData));
    }
  } catch (error) {
    console.error('Error deleting trip:', error);
    dispatch(setTripErrors({ server: 'An unexpected error occurred.' }));
  }
};

// Initial state
const initialState = {
  tripDetails: null,
  trips: [],
  loading: false,
  errors: {}
};

// Reducer
const tripReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TRIPS:
      return {
        ...state,
        trips: action.trips,
        loading: false,
        errors: {}
      }
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