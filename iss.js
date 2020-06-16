/* eslint-disable camelcase */
/* eslint-disable prefer-destructuring */
const request = require('request');


/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function (cb) {
  // use request to fetch IP address from JSON API
  const url = 'https://api.ipify.org?format=json';
  request(url, (error, response, body) => {
    if (error) {
      cb(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      cb(Error(msg), null);
      return;
    }
    const ip = (JSON.parse(body)).ip;
    cb(null, ip);
  });
};


const fetchCoordsByIP = function (ip, cb) {
  // use request to fetch latitute and longitude given an ip address
  const url = `https://ipvigilante.com/${ip}`;
  request(url, (error, response, body) => {
    if (error) {
      cb(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates. Response: ${body}`;
      cb(Error(msg), null);
      return;
    }
    const l_body = JSON.parse(body);
    cb(null, { latitude: l_body.data.latitude, longitude: l_body.data.longitude });
  });
};


/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function (coords, cb) {
  try {
    const url = `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`;
    request(url, (error, response, body) => {
      if (error) {
        cb(error, null);
        return;
      }
      // if non-200 status, assume server error
      if (response.statusCode !== 200) {
        const msg = `Status Code ${response.statusCode} when fetching fly-over times. Response: ${body}`;
        cb(Error(msg), null);
        return;
      }
      const flyoverTimes = (JSON.parse(body)).response;
      cb(null, flyoverTimes);
    });
  } catch (error) {
    const msg = `Could not retrieve flyover times: ${error}`;
    cb(Error(msg), null);
  }
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function (cb) {
  fetchMyIP((error, ip) => {
    if (error) {
      cb(error, null);
      return;
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        cb(error, null);
        return;
      }
      fetchISSFlyOverTimes(coords, (error, times) => {
        if (error) {
          cb(error, null);
          return;
        }
        cb(null, times);
      });
    });
  });
};

module.exports = {
  fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation,
};
