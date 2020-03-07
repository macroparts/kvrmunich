import { checkForFreedUpTimeSlots } from "./kvr/kvr";

// module.exports.hello = async (): Promise<any> => {
//   return new Promise(function(resolve) {
//     checkForFreedUpTimeSlots().then((response: State) =>
//       resolve({
//         statusCode: 200,
//         body: JSON.stringify(response)
//       })
//     );
//   });
// };

checkForFreedUpTimeSlots().then(() => console.log("ok"));
