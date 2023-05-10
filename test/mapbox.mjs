import fs from 'fs';
import geojsonvt from 'geojson-vt';

import circleToPolygon from 'circle-to-polygon';

function generateCircle(center, radius, { numberOfEdges = 32 }) {
  function offset(c1, distance, earthRadius, bearing) {
    const lat1 = (c1[1] * Math.PI) / 180;
    const lon1 = (c1[0] * Math.PI) / 180;
    const dByR = distance / earthRadius;
    const lat = Math.asin(
      Math.sin(lat1) * Math.cos(dByR) +
        Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing)
    );
    const lon =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
        Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat)
      );

    return [(lon * 180) / Math.PI, (lat * 180) / Math.PI];
  }

  const n = numberOfEdges;
  const earthRadius = 6378137; // default earth radius assumed by WGS 84
  const bearing = 0;
  const direction = false;

  const start = (bearing * Math.PI) / 180;
  var coordinates = [];
  for (var i = 0; i < n; ++i) {
    coordinates.push(
      offset(
        center,
        radius,
        earthRadius,
        start + (direction * 2 * Math.PI * -i) / n
      )
    );
  }
  coordinates.push(coordinates[0]);

  return {
    type: 'Polygon',
    coordinates: [coordinates]
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
  const center = [106.6721117, 10.7946879]; //[lat,lon]
  const radius = 500; // in meters
  const options = { numberOfEdges: 64 }; //optional, defaults to { numberOfEdges: 32 }

  const polygon = circleToPolygon(center, radius, options);
//   const polygon = generateCircle(center, radius, options);

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
