import fs from 'fs';
import geojsonvt from 'geojson-vt';

import circleToPolygon from 'circle-to-polygon';

const _getTileInfo = (lat, lng, z) => {
  const lng_rad = (lng * Math.PI) / 180;
  const R = 128 / Math.PI;
  const worldCoordX = R * (lng_rad + Math.PI);
  const pixelCoordX = worldCoordX * Math.pow(2, z);
  const tileCoordX = Math.floor(pixelCoordX / 256);

  const lat_rad = (lat * Math.PI) / 180;
  const worldCoordY =
    (-R / 2) * Math.log((1 + Math.sin(lat_rad)) / (1 - Math.sin(lat_rad))) +
    128;
  const pixelCoordY = worldCoordY * Math.pow(2, z);
  const tileCoordY = Math.floor(pixelCoordY / 256);

  return {
    x: tileCoordX,
    y: tileCoordY,
    pX: Math.floor(pixelCoordX - tileCoordX * 256),
    pY: Math.floor(pixelCoordY - tileCoordY * 256)
  };
};

/**
 * This function is used to generate a circle polygon. It ported from https://github.dev/gabzim/circle-to-polygon#readme
 * It is sample of code, need to be refactored
 * @param {*} center
 * @param {*} radius
 * @param {*} param2
 * @returns
 */
function generateCircle(center, radius, { numberOfEdges = 32 }) {
  const dByR = radius / 6378137; // distance divided by the radius of the Earth in meters
  const sinLat = Math.sin((center[1] * Math.PI) / 180);
  const cosLat = Math.cos((center[1] * Math.PI) / 180);
  const sinDByR = Math.sin(dByR);
  const cosDByR = Math.cos(dByR);
  const coordinates = [];

  for (let i = 0; i < numberOfEdges; i++) {
    const bearing = (2 * Math.PI * i) / numberOfEdges;
    const sinBearing = Math.sin(bearing);
    const cosBearing = Math.cos(bearing);
    const lat = Math.asin(sinLat * cosDByR + cosLat * sinDByR * cosBearing);
    const lon =
      (center[0] * Math.PI) / 180 +
      Math.atan2(
        sinBearing * sinDByR * cosLat,
        cosDByR - sinLat * Math.sin(lat)
      );

    const lon180 = (lon * 180) / Math.PI;
    const lat180 = (lat * 180) / Math.PI;

    coordinates.push([lon180, lat180]);
  }

  coordinates.push(coordinates[0]);

  return {
    type: 'Polygon',
    coordinates: [coordinates]
  };
}

const run = async () => {
  // my current location
  const center = [106.6721117, 10.7946879]; //[lat,lon]
  const radius = 500; // in meters
  const options = { numberOfEdges: 64 }; //optional, defaults to { numberOfEdges: 32 }

  //   const polygon = circleToPolygon(center, radius, options);
  const polygon = generateCircle(center, radius, options);

  const geoJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: polygon,
        properties: {}
      },
      {
        // my current location
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center
        },
        properties: {}
      }
    ]
  };

  const data = fs.writeFileSync(
    './data/map.geojson',
    JSON.stringify(geoJSON, null, 2)
  );

  console.log(JSON.stringify(polygon, null, 2));
};

run();
