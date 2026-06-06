// src/utils/pakLocations.js
// Hardcoded city data — no API needed for manual selection

export const PAK_CITIES_DATA = {
  Lahore:          { lat: 31.5204, lon: 74.3587, rainfall: 500  },
  Karachi:         { lat: 24.8607, lon: 67.0011, rainfall: 200  },
  Faisalabad:      { lat: 31.4504, lon: 73.1350, rainfall: 350  },
  Multan:          { lat: 30.1978, lon: 71.4711, rainfall: 170  },
  Peshawar:        { lat: 34.0151, lon: 71.5249, rainfall: 400  },
  Quetta:          { lat: 30.1798, lon: 66.9750, rainfall: 250  },
  Islamabad:       { lat: 33.6844, lon: 73.0479, rainfall: 900  },
  Rawalpindi:      { lat: 33.5651, lon: 73.0169, rainfall: 800  },
  Sialkot:         { lat: 32.4945, lon: 74.5229, rainfall: 750  },
  Gujranwala:      { lat: 32.1877, lon: 74.1945, rainfall: 600  },
  Hyderabad:       { lat: 25.3960, lon: 68.3578, rainfall: 180  },
  Sukkur:          { lat: 27.7052, lon: 68.8574, rainfall: 120  },
  Bahawalpur:      { lat: 29.3956, lon: 71.6836, rainfall: 140  },
  Sargodha:        { lat: 32.0836, lon: 72.6711, rainfall: 380  },
  Sheikhupura:     { lat: 31.7167, lon: 73.9850, rainfall: 520  },
  Jhang:           { lat: 31.2681, lon: 72.3181, rainfall: 320  },
  Narowal:         { lat: 32.1049, lon: 74.8749, rainfall: 700  },
  Kasur:           { lat: 31.1167, lon: 74.4500, rainfall: 480  },
  Shakargarh:      { lat: 32.2635, lon: 75.1602, rainfall: 720  },
  Gujrat:          { lat: 32.5738, lon: 74.0782, rainfall: 650  },
  Sahiwal:         { lat: 30.6706, lon: 73.1064, rainfall: 420  },
  Okara:           { lat: 30.8138, lon: 73.4534, rainfall: 390  },
  'Rahim Yar Khan':{ lat: 28.4212, lon: 70.2989, rainfall: 200  },
  Hafizabad:       { lat: 32.0711, lon: 73.6878, rainfall: 560  },
  Chiniot:         { lat: 31.7201, lon: 72.9786, rainfall: 400  },
  Khanewal:        { lat: 30.3010, lon: 71.9322, rainfall: 250  },
  Vehari:          { lat: 30.0454, lon: 72.3513, rainfall: 230  },
  'Dera Ghazi Khan':{ lat: 30.0489, lon: 70.6343, rainfall: 200 },
  Mardan:          { lat: 34.2008, lon: 72.0445, rainfall: 500  },
  Abbottabad:      { lat: 34.1463, lon: 73.2117, rainfall: 1200 },
  Larkana:         { lat: 27.5570, lon: 68.2247, rainfall: 130  },
  Jacobabad:       { lat: 28.2769, lon: 68.4510, rainfall: 110  },
}

export const PAK_CITY_NAMES = Object.keys(PAK_CITIES_DATA)

// Get coords for a city — always works, no API needed
export const getCityCoords = (cityName) => {
  return PAK_CITIES_DATA[cityName] || null
}