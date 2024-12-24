'use client';
import React, { createContext, useContext, useReducer } from 'react';
// type Appointment = {
//   $id: string;
//   [key: string]: any; // Other appointment properties
// };
import { Appointment, Patient, Doctor } from '@/types/appwrite.types';

type State = {
  appointments: Appointment[];
  doctors: Doctor[];
  clients: Patient[];
};

type Action =
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'CREATE_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'SET_DOCTORS'; payload: Doctor[] }
  | { type: 'CREATE_DOCTOR'; payload: Doctor }
  | { type: 'UPDATE_DOCTOR'; payload: Doctor }
  | { type: 'SET_CLIENTS'; payload: Patient[] }
  | { type: 'CREATE_CLIENT'; payload: Patient }
  | { type: 'UPDATE_CLIENT'; payload: Patient };

// Action types
export const ActionTypes = {
  SET_APPOINTMENTS: 'SET_APPOINTMENTS',
  CREATE_APPOINTMENT: 'CREATE_APPOINTMENT',
  UPDATE_APPOINTMENT: 'UPDATE_APPOINTMENT',
  SET_DOCTORS: 'SET_DOCTORS',
  CREATE_DOCTOR: 'CREATE_DOCTOR',
  UPDATE_DOCTOR: 'UPDATE_DOCTOR',
  SET_CLIENTS: 'SET_CLIENTS',
  CREATE_CLIENT: 'CREATE_CLIENT',
  UPDATE_CLIENT: 'UPDATE_CLIENT',
};

// Initial state
const initialState = {
  appointments: [],
  doctors: [],
  clients: [],
};

// Reducer function
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.SET_APPOINTMENTS:
      return { ...state, appointments: action.payload };
    case ActionTypes.CREATE_APPOINTMENT:
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
      };
    case ActionTypes.UPDATE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.map(appointment =>
          appointment.$id === action.payload.$id ? action.payload : appointment
        ),
      };
    case ActionTypes.SET_DOCTORS:
      return { ...state, doctors: action.payload };
    case ActionTypes.CREATE_DOCTOR:
      return { ...state, doctors: [action.payload, ...state.doctors] };
    case ActionTypes.UPDATE_DOCTOR:
      return {
        ...state,
        doctors: state.doctors.map(doctor =>
          doctor.$id === action.payload.$id ? action.payload : doctor
        ),
      };
    case ActionTypes.SET_CLIENTS:
      return { ...state, clients: action.payload };
    case ActionTypes.CREATE_CLIENT:
      return { ...state, clients: [action.payload, ...state.clients] };
    case ActionTypes.UPDATE_CLIENT:
      return {
        ...state,
        clients: state.clients.map(client =>
          client.$id === action.payload.$id ? action.payload : client
        ),
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

// Create Context

// State Context
const GlobalStateContext = createContext<State | undefined>(undefined);

// Dispatch Context
const GlobalDispatchContext = createContext<React.Dispatch<Action> | undefined>(
  undefined
);

// Provider Component
export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
};

// Hooks to use state and dispatch
export const useGlobalState = (): State => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
};

export const useGlobalDispatch = (): React.Dispatch<Action> => {
  const context = useContext(GlobalDispatchContext);
  if (context === undefined) {
    throw new Error('useGlobalDispatch must be used within a GlobalProvider');
  }
  return context;
};
