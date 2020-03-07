import { readFileSync, writeFileSync } from "fs";
import { sep } from "path";

const pathToState: string = process.env.STORAGE_ROOT + sep + "state.json";

export interface State {
  lastErrorNotification: string;
  errors: Array<string>;
  earliestAppointmentDate: string;
}

const initialState: State = {
  lastErrorNotification: "1970-01-01",
  errors: [],
  earliestAppointmentDate: "2020-06-05"
};

export function read(): State {
  let state = initialState;
  try {
    state = JSON.parse(readFileSync(pathToState).toString());
  } catch (error) {}

  return state;
}

export function write(state: State): void {
  writeFileSync(pathToState, JSON.stringify(state));
}
