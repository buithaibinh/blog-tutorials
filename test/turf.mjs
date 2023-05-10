import * as turf from '@turf/turf';
import fs from 'fs';

const bearingToDirection = (bearing) => {
  // If the bearing is between 0 and 22.5 degrees or between 337.5 and 360 degrees, the direction is "North".
  // If the bearing is between 22.5 and 67.5 degrees, the direction is "Northeast".
  // If the bearing is between 67.5 and 112.5 degrees, the direction is "East".
  // If the bearing is between 112.5 and 157.5 degrees, the direction is "Southeast".
  // If the bearing is between 157.5 and 202.5 degrees, the direction is "South".
  // If the bearing is between 202.5 and 247.5 degrees, the direction is "Southwest".
  // If the bearing is between 247.5 and 292.5 degrees, the direction is "West".
  // If the bearing is between 292.5 and 337.5 degrees, the direction is "Northwest".

  const directions = [
    'North',
    'Northeast',
    'East',
    'Southeast',
    'South',
    'Southwest',
    'West',
    'Northwest'
  ];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

const calculateBearing = (point1, point2) => {
  const bearing = turf.bearing(point1, point2);
  return bearing < 0 ? bearing + 360 : bearing;
};

const run = async () => {
  // my current location
  const myLocation = turf.point([106.6721117, 10.7946879]); //[lng, lat]

  // CityHouse -  Emerald Apartment, near my current location
  const target = turf.point([106.6721422, 10.794473]);

  // bearing from my current location to CityHouse -  Emerald Apartment
  const bearing = calculateBearing(myLocation, target);

  // distance from my current location to CityHouse -  Emerald Apartment
  const distance = turf.distance(myLocation, target, {
    units: 'meters'
  });

  const direction = bearingToDirection(bearing);
  console.log(direction, distance);

  // circle around my current location
  const radius = 500; // in meters
  const options = {
    steps: 64,
    units: 'metres',
    properties: { foo: 'bar' }
  };
  const circle = turf.circle(myLocation, radius, options);

  const geoJSON = {
    type: 'FeatureCollection',
    features: [circle, myLocation, target]
  };

  fs.writeFileSync(
    './data/map.geojson',
    JSON.stringify(geoJSON, null, 2)
  );
};

run();
