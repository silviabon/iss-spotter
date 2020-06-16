/* eslint-disable prefer-destructuring */
const request = require('request-promise-native');

/*
 * Requests user's ip address from https://www.ipify.org/
 * Input: None
 * Returns: Promise of request for ip data, returned as JSON string
 */
const fetchMyIP = function () {
  return request('https://api.ipify.org?format=json');
};

const fetchCoordsByIP = function (body) {
  // use request to fetch latitute and longitude given an ip address
  const ip = JSON.parse(body).ip;
  const url = `https://ipvigilante.com/${ip}`;
  return request(url);
};

const fetchISSFlyOverTimes = function (coords) {
  const { latitude, longitude } = JSON.parse(coords).data;
  const url = `http://api.open-notify.org/iss-pass.json?lat=${latitude}&lon=${longitude}`;
  return request(url);
};

const nextISSTimesForMyLocation = function () {
  return fetchMyIP()
    .then(fetchCoordsByIP)
    .then(fetchISSFlyOverTimes)
    .then((data) => {
      const { response } = JSON.parse(data);
      return response;
    });
};


module.exports = { nextISSTimesForMyLocation };
