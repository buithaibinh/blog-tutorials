import * as turf from '@turf/turf';
import fs from 'fs';

const _makeUrl = (url, tileInfo) => {
  var result = url.url.replace('{x}', tileInfo.x);
  result = result.replace('{y}', tileInfo.y);
  result = result.replace('{z}', url.zoom);
  return result;
};

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
  console.time('run');
  // my current location, fake to Tokyo station
  const myLatLng = [139.76711519040336, 35.68136418921732];
  const myLocation = turf.point(myLatLng, {
    'marker-color': '#b26666',
    'marker-size': 'medium'
  }); //[lng, lat]

  // near my current location, fake to Palace Hotel Tokyo
  const target = turf.point([139.76129711582556, 35.684691980933465]);
  // bearing from my curren10.797566792888107, 106.67249316749793t location to CityHouse -  Emerald Apartment
  const bearing = calculateBearing(target, myLocation);
  target.properties.bearing = bearing;

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

  // calc area of circle
  const area = turf.area(circle);
  // Returns number area in square meters
  console.log(Math.round(area));

  // get tile info of my current location
  const zoom = 17;
  const tileInfo = _getTileInfo(myLatLng[1], myLatLng[0], zoom);

  // build flood url
  const url = _makeUrl(
    {
      url: 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',
      zoom
    },
    tileInfo
  );
  console.log(url);

  // --------
  const bbox = turf.bbox(circle);
  // every 50 meters
  const cellSize = 50; // in meters
  const grid = turf.squareGrid(bbox, cellSize, { units: 'meters' });

  console.log('Generate grid: ', grid.features.length, 'squares');

  // find all squares inside circle
  const squaresInsideCircle = grid.features.filter((square) => {
    const overlap = turf.booleanOverlap(circle, square);
    return overlap || turf.booleanContains(circle, square);
  });

  const centerPoints = squaresInsideCircle.map((square) => {
    // const randomPoints = turf.randomPoint(4, { bbox: turf.bbox(square) });
    const center = turf.center(square);
    const isInside = turf.booleanPointInPolygon(center, circle);
    if (!isInside) {
      center.properties = {
        'marker-color': '#FF0000'
      };
    }
    return center;
  });
  // .filter((center) => {
  //   return turf.booleanPointInPolygon(center, circle);
  // });

  console.log('Gen total points: ', centerPoints.length);

  const geoJSON = {
    type: 'FeatureCollection',
    features: [
      circle,
      myLocation,
      target,
      turf.lineString([myLatLng, target.geometry.coordinates], {
        stroke: '#FF0000' // red
      }),
      ...squaresInsideCircle,
      ...centerPoints
    ]
  };

  console.timeEnd('run');
  fs.writeFileSync('./data/map.geojson', JSON.stringify(geoJSON, null, 2));
};

run();
