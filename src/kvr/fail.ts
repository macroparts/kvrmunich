import moment from "moment";
import { sendmail } from "./sendmail";
import { read, write } from "./state";
const dateFormat = "YYYY-MM-DD";

export function fail(reason: string): void {
  const state = read();
  const msg = moment().format() + " " + reason;

  state.errors.unshift(msg);

  if (state.lastErrorNotification === moment().format(dateFormat)) {
    write(state);
    process.exit();
  }

  sendmail("KVR Script Fehler", msg);
  state.lastErrorNotification = moment().format(dateFormat);
  write(state);
  process.exit();
}
