// "use client";

// import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete.hook";

// export default function TestPlacesPage() {
//   const { query, setQuery, data, isLoading, error } =
//     usePlacesAutocomplete("");

//   return (
//     <div className="mx-auto max-w-2xl px-6 py-10">
//       <h1 className="text-2xl font-semibold">Places Autocomplete Test</h1>
//       <p className="mt-2 text-sm text-muted-foreground">
//         Type to fetch predictions from the internal API route.
//       </p>

//       <div className="mt-6">
//         <label
//           htmlFor="places-query"
//           className="text-sm font-medium"
//         >
//           Query
//         </label>
//         <input
//           id="places-query"
//           className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
//           placeholder="Start typing an address..."
//           value={query}
//           onChange={(event) => setQuery(event.target.value)}
//         />
//       </div>

//       <div className="mt-6 space-y-2 text-sm">
//         {isLoading && <p>Loading…</p>}
//         {error && <p className="text-destructive">{error}</p>}
//         {!isLoading && !error && data.length > 0 && (
//           <ul className="space-y-2">
//             {data.map((item) => (
//               <li
//                 key={`${item.place_id ?? item.description}`}
//                 className="rounded-md border border-input bg-muted px-3 py-2 text-xs"
//               >
//                 <span className="font-medium">
//                   {item.structured_formatting?.main_text ??
//                     item.description}
//                 </span>
//                 {item.structured_formatting?.secondary_text && (
//                   <span className="text-muted-foreground">
//                     {" "}
//                     {item.structured_formatting.secondary_text}
//                   </span>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//         {!isLoading && !error && data.length === 0 && (
//           <p className="text-muted-foreground">No results yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }

import React from "react";

const Page = () => {
  return <div>test</div>;
};

export default Page;
