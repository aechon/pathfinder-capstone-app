import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sessionReducer from './session';
import tripReducer from './trip';
import preferenceReducer from './preference';
import vehicleReducer from './vehicle';

const rootReducer = combineReducers({
  // ADD REDUCERS HERE
  session: sessionReducer,
  trip: tripReducer,
  preference: preferenceReducer,
  vehicle: vehicleReducer
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
