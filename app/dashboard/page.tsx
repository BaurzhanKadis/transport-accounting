// "use client";
// import React from "react";

// import { Transport } from "@prisma/client";
// import { useDebounce } from "react-use";
// import { Api } from "@/services/api-client";

// export default function Dashboard() {
//   const [allTransports, setAllTransports] = React.useState<Transport[]>([]);

//   useDebounce(
//     async () => {
//       try {
//         const response = await Api.transports.allTransport();
//         setAllTransports(response);
//       } catch (error) {
//         console.log(error);
//       }
//     },
//     150,
//     []
//   );
//   return (
//     <div className="flex flex-1 flex-col gap-4 p-4">
//       <div className="grid auto-rows-min gap-4 md:grid-cols-3">
//         <div className="aspect-video rounded-xl bg-muted/50 bg-gradient-to-r text-white from-cyan-500 to-blue-500">
//           <div className="flex justify-between p-3 border-b-2 border-b-white mb-3">
//             <span>ТС</span>
//             <strong>{allTransports.length}</strong>
//           </div>
//           <div className="px-3">На ремонте:</div>
//           <div className="px-3">На ремонте:</div>
//           <div className="px-3">На ремонте:</div>
//         </div>
//         <div className="aspect-video rounded-xl bg-muted/50"></div>
//         <div className="aspect-video rounded-xl bg-muted/50"></div>
//       </div>
//       <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div>
//     </div>
//   );
// }
