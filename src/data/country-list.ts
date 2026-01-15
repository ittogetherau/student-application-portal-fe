export const countriesAndNationalities = [
  { id: 9, country: "Australia", nationality: "Australian" },
  { id: 12, country: "Christmas Island", nationality: "Christmas Islander" },
  { id: 15, country: "Cocos (Keeling) Islands", nationality: "Cocos Islander" },
  { id: 43, country: "Norfolk Island", nationality: "Norfolk Islander" },
  { id: 49, country: "New Zealand", nationality: "New Zealander" },
  { id: 55, country: "New Caledonia", nationality: "New Caledonian" },
  { id: 62, country: "New Ireland", nationality: "New Irish" },
  { id: 64, country: "Papua New Guinea", nationality: "Papua New Guinean" },
  { id: 73, country: "Solomon Islands", nationality: "Solomon Islander" },
  { id: 80, country: "Vanuatu", nationality: "Ni-Vanuatu" },
  { id: 85, country: "Guam", nationality: "Guamanian" },
  { id: 93, country: "Kiribati", nationality: "I-Kiribati" },
  { id: 98, country: "Marshall Islands", nationality: "Marshallese" },
  {
    id: 100,
    country: "Micronesia, Federated States of",
    nationality: "Micronesian",
  },
  { id: 101, country: "Nauru", nationality: "Nauruan" },
  {
    id: 103,
    country: "Northern Mariana Islands",
    nationality: "Northern Mariana Islander",
  },
  { id: 104, country: "Palau", nationality: "Palauan" },
  { id: 108, country: "Cook Islands", nationality: "Cook Islander" },
  { id: 114, country: "Fiji", nationality: "Fijian" },
  { id: 118, country: "French Polynesia", nationality: "French Polynesian" },
  { id: 122, country: "Niue", nationality: "Niuean" },
  { id: 124, country: "Samoa", nationality: "Samoan" },
  { id: 127, country: "American Samoa", nationality: "American Samoan" },
  { id: 129, country: "Tokelau", nationality: "Tokelauan" },
  { id: 131, country: "Tonga", nationality: "Tongan" },
];

// Helper function to get all countries for dropdown
export const getCountriesList = () => {
  return countriesAndNationalities.map((item) => item.country);
};

// Helper function to get all nationalities for dropdown
export const getNationalitiesList = () => {
  return Array.from(
    new Set(countriesAndNationalities.map((item) => item.nationality))
  ).sort();
};
