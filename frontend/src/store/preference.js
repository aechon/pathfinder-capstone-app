import { csrfFetch } from "./csrf";

const SET_PREFERENCES = 'SET_PREFERENCES';
const SET_PREFERENCE_ERRORS = 'SET_PREFERENCE_ERRORS';
const CLEAR_PREFERENCES = 'CLEAR_PREFERENCES';
const FETCH_PREFERENCES_REQUEST = 'FETCH_PREFERENCES_REQUEST';

// Action Creators
const setPreferences = (preferences) => ({
  type: SET_PREFERENCES,
  preferences,
});

const setPreferenceErrors = (errors) => ({
  type: SET_PREFERENCE_ERRORS,
  errors,
});

export const clearPreferences = () => ({
  type: CLEAR_PREFERENCES,
});

// Action creators for fetching data
const fetchPreferencesRequest = () => ({
  type: FETCH_PREFERENCES_REQUEST,
});

// Thunk Action Creators
export const fetchUserPreferences = () => async (dispatch) => {
  dispatch(fetchPreferencesRequest());
  try {
    const response = await csrfFetch('/api/tags/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const preferences = await response.json();
      dispatch(setPreferences(preferences));
    } else {
      const errorData = await response.json();
      dispatch(setPreferenceErrors(errorData));
    }
  } catch (error) {
    console.error("Error fetching user's preferences:", error);
    dispatch(setPreferenceErrors({ server: 'An unexpected error occurred.' }));
  }
};

export const deleteTag = (id) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/tags/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      return response;
    } else {
      const errorData = await response.json();
      dispatch(setPreferenceErrors(errorData));
    }
  } catch (error) {
    console.error('Error deleting tag:', error);
    dispatch(setPreferenceErrors({ server: 'An unexpected error occurred.' }));
  }
};

// Initial state
const initialState = {
  preferences: [],
  loading: false,
  errors: {}
};

// Reducer
const preferenceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PREFERENCES:
      return {
        ...state,
        preferences: action.preferences,
        loading: false,
        errors: {}
      }
    case SET_PREFERENCE_ERRORS:
      return {
        ...state,
        loading: false,
        errors: action.errors
      }
    case FETCH_PREFERENCES_REQUEST:
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

export default preferenceReducer;