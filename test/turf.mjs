import * as turf from '@turf/turf';
import fs from 'fs';
import getPixels from 'get-pixels';

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

const getColorsOfTile = (url) => {
  // 256 x 256 = 65536 pixels
  return new Promise((resolve, reject) => {
    getPixels(url, function (err, pixels) {
      if (err) {
        console.log('Error reading image url:', url);
        return resolve([]);
      }

      // get the dimensions of the image

      const width = pixels.shape[0];
      const height = pixels.shape[1];

      // loop through the pixels and convert each to a value
      const pixelArray = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const r = pixels.get(x, y, 0);
          const g = pixels.get(x, y, 1);
          const b = pixels.get(x, y, 2);
          pixelArray.push([r, g, b]);
        }
      }

      resolve(pixelArray);
    });
  });
};

const FloodRiskLevel = {
  noFloodRisk: 0,
  floofRiskLevel1: 1,
  floofRiskLevel2: 2,
  floofRiskLevel3: 3,
  floofRiskLevel4: 4,
  floofRiskLevel5: 5,
  floofRiskLevel6: 6
}

const _getFloodLevel = (r, g, b) => {
  // convert rgb to hex
  const tileColor =
    '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');

  let level;
  switch (tileColor) {
    case '#f7f5a9':
      level = FloodRiskLevel.floofRiskLevel1;
      break;
    case '#ffd8c0':
      level = FloodRiskLevel.floofRiskLevel2;
      break;
    case '#ffb7b7':
      level = FloodRiskLevel.floofRiskLevel3;
      break;
    case '#ff9191':
      level = FloodRiskLevel.floofRiskLevel4;
      break;
    case '#f285c9':
      level = FloodRiskLevel.floofRiskLevel5;
      break;
    case '#dc7adc':
      level = FloodRiskLevel.floofRiskLevel6;
      break;
    default:
      level = FloodRiskLevel.noFloodRisk;
  }

  return level;
};

// cached tiles of colors
const cachedTiles = {};

const run = async ({
  centerLatLng,
  radius = 500,
  zoom = 16,
  cellSize = 50
}) => {
  console.time('run');
  // my current location, fake to Tokyo station
  const center = turf.point(centerLatLng, {
    'marker-color': '#b26666',
    'marker-size': 'medium'
  }); //[lng, lat]

  // circle around my current location
  const options = {
    steps: 64,
    units: 'metres',
    properties: {
      fill: '#b26666',
      stroke: '#555555',
      'stroke-width': 2,
      'stroke-opacity': 1,
      'fill-opacity': 0.3
    }
  };
  // generate grid inside circle
  const circle = turf.circle(center, radius, options);
  const bbox = turf.bbox(circle);
  const grid = turf.squareGrid(bbox, cellSize, { units: 'meters' });

  // filter grid to only include tiles inside circle or overlap with circle
  const tiles = grid.features.filter((square) => {
    const overlap = turf.booleanOverlap(circle, square);
    return overlap || turf.booleanContains(circle, square);
  });

  console.log(
    'Generate grid: ',
    grid.features.length,
    'squares',
    'there are',
    tiles.length,
    'tiles inside circle'
  );

  // every tile, pick one a point on the tile
  let urls = [];
  const tilePoints = tiles.map((tile) => {
    const p = turf.pointOnFeature(tile);
    const tileInfo = _getTileInfo(
      p.geometry.coordinates[1],
      p.geometry.coordinates[0],
      zoom
    );

    const url = _makeUrl(
      {
        url: 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',
        zoom: zoom
      },
      tileInfo
    );

    urls.push(url);

    return {
      ...p,
      properties: {
        tileInfo,
        url
      }
    };
  });

  console.log(
    'with radius',
    radius,
    'meters.',
    'Generate tilePoints:',
    tilePoints.length,
    'points'
  );

  // unique urls
  urls = [...new Set(urls)];
  console.log('urls', urls.length, urls);

  // get all colors of tiles in parallel and cache them
  await Promise.all(
    urls.map((url) => {
      if (cachedTiles[url]) {
        return cachedTiles[url];
      }
      return getColorsOfTile(url).then((colors) => {
        cachedTiles[url] = colors;
        return colors;
      });
    })
  );
  // save the colors to a file
  // fs.writeFileSync(`./data/colors.json`, JSON.stringify(cachedTiles, null, 2));

  // Now we will loop through all the tilePoints and find the color of the tile it belongs to
  // and assign the color to the tilePoint
  tilePoints.forEach((tilePoint) => {
    const { tileInfo, url } = tilePoint.properties;
    const colors = cachedTiles[url];

    // get the color of the tilePoint
    // this code is sample, let integrate it with your code
    const x = tileInfo.x % 256;
    const y = tileInfo.y % 256;
    const index = y * 256 + x;
    const color = colors[index];

    // assign the color to the tilePoint
    tilePoint.properties.color = color;

    // based on the color, assign the flood level
    const [r, g, b] = color;
    const floodLevel = _getFloodLevel(r, g, b);
    tilePoint.properties.floodLevel = floodLevel;
  });

  const geoJSON = {
    type: 'FeatureCollection',
    features: [circle, center, ...tiles, ...tilePoints]
  };

  // fs.writeFileSync('./data/map.geojson', JSON.stringify(geoJSON, null, 2));

  console.timeEnd('run');
};
// ==== with radius 500 meters. Generate tilePoints: 64 points
// zoom 17: has 15 tiles
// zoom 16: has 7
// zoom 15: has 4
// zoom 14: has 2
// zoom 13 and below: has 1

run({
  centerLatLng: [139.767125, 35.681236],
  radius: 50, // in meters
  zoom: 10, // 16 is good enough
  cellSize: 1 // in meters
});
