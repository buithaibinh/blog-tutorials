import fs from 'fs';
import geojsonvt from 'geojson-vt';

import circleToPolygon from 'circle-to-polygon';

function generateCircle(center, radius, numPoints = 64) {
  const coords = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints;
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);
    const lon = center[0] + dx / Math.cos((center[1] * Math.PI) / 180);
    let lat = center[1] + dy / 111319.9;
    lat = Math.max(Math.min(lat, 90), -90); // Ensure latitude is within valid range
    coords.push([lon, lat]);
  }
  coords.push(coords[0]); // close the polygon
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    },
    properties: {}
  };
}

const run = async () => {
  //   const data = fs.readFileSync('./data/map.geojson', 'utf8');
  //   const geoJSON = JSON.parse(data);
  //   console.log(geoJSON);

  //   // build an initial index of tiles
  //   const tileIndex = geojsonvt(geoJSON, {
  //     maxZoom: 14 // max zoom to preserve detail on; can't be higher than 24
  //   });

  //   console.log(tileIndex);

  //   console.log('Hello World');

  // my current location
  const center = [106.6721117, 10.7946879, 16]; //[lon, lat]
  const radius = 500; // in meters
  const options = { numberOfEdges: 64 }; //optional, defaults to { numberOfEdges: 32 }

  //   const polygon = circleToPolygon(center, radius, options);
  //   console.log(JSON.stringify(polygon, null, 2));

  const circle = generateCircle(center, radius);
  console.log(JSON.stringify(circle, null, 2));
};

run();
