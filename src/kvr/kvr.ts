import { State, read, write } from "./state";
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { sendmail } from "./sendmail";
import { fail } from "./fail";
import * as cookie from "cookie";

interface Response {
  data: string;
}

interface AppointmentDate {
  [key: string]: Array<string>;
}

function parseHtmlForAppointments(html: string): Array<AppointmentDate> {
  const matches = html.match(/jsonAppoints = '(.+)';/);
  if (!matches) {
    fail("Html parsing failed");
    return [];
  }

  if (!matches[1]) {
    fail("Html parsing failed");
    return [];
  }

  try {
    return JSON.parse(matches[1])["Termin Beratung"].appoints;
  } catch (error) {
    fail("Unexpected data structure");
  }

  return [];
}

function getEarliestAppointmentDate(
  appointments: Array<AppointmentDate>
): string {
  for (const date in appointments) {
    if (appointments[date].length) {
      return date;
    }
  }

  fail("No appointments found");
  return "";
}

function compareAppointmentsAndReact(
  appointments: Array<AppointmentDate>
): void {
  const stateObj = read();

  const earliestAppointmentDate = getEarliestAppointmentDate(appointments);

  const foundEarlyDate =
    stateObj.earliestAppointmentDate > earliestAppointmentDate;

  stateObj.earliestAppointmentDate = earliestAppointmentDate;
  write(stateObj);

  if (foundEarlyDate) {
    sendmail("Neuen freien Termin entdeckt", earliestAppointmentDate);
  } else {
    console.log("nothing new");
  }
}

export function checkForFreedUpTimeSlots(): Promise<State> {
  const reqConf: AxiosRequestConfig = {
    method: "post",
    url: "https://www5.muenchen.de/view-einbg/termin/index.php",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data:
      "step=WEB_APPOINT_SEARCH_BY_CASETYPES&CASETYPES%5BBeratungsgespr%C3%A4ch+f%C3%BCr+Einb%C3%BCrgerung%5D=1&CASETYPES%5BAntragstellung%5D=0&CASETYPES%5BUrkunden%C3%BCbergabe%5D=0"
  };

  const promise = new Promise<State>(function(resolve) {
    Axios.request(reqConf)
      .then(function(response: AxiosResponse) {
        const cookieObj = cookie.parse(response.headers["set-cookie"][0]);
        reqConf.headers["Cookie"] = "PHPSESSID=" + cookieObj["PHPSESSID"];

        Axios.request(reqConf)
          .then(function(response: Response) {
            compareAppointmentsAndReact(
              parseHtmlForAppointments(response.data)
            );
            resolve(read());
          })
          .catch(function() {
            fail("Http request failed");
          });
      })
      .catch(function() {
        fail("Http cookie request failed");
      });
  });

  return promise;
}
