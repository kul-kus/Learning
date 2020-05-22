
var initLat = -33.92, initLng = 151.25

var locations = [
    // name lat long
    ['Cronulla Beach', -34.028249, 151.157507, 3], //0
    ['Maroubra Beach', -33.950198, 151.259302, 1],  //7.94297328927069
    ['Coogee Beach', -33.923036, 151.259052, 5],  // 9.311200096676549
    ['Bondi Beach', -33.890542, 151.274856, 4],  //11.65141708472417

    ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],  //17.436366176503938

    ['kul1', -32.940198, 151.259302, 1],  //75.40575058899985
    ['kul 2', -31.92398, 151.259302, 1],   //145.51094451323226
    ['kul 3', -30.9523428, 145.259302, 1], //404.0206579592084
    ['Arkstone', -34.0675096, 149.6009444, 1], //95.013806
];

let index = 8
let miles = 5
// console.log(locations[0][2])
console.log("=====> ", haversineDistance(initLat, initLng, locations[index][1], locations[index][2], miles))

function haversineDistance(latA, lngA, latB, lngB, miles) {
    const toRadian = angle => (Math.PI / 180) * angle;
    const distance = (a, b) => (Math.PI / 180) * (a - b);
    const RADIUS_OF_EARTH_IN_KM = 6371;

    let lat1 = latA;
    let lat2 = latB;
    const lon1 = lngA;
    const lon2 = lngB;

    const dLat = distance(lat2, lat1);
    const dLon = distance(lon2, lon1);

    lat1 = toRadian(lat1);
    lat2 = toRadian(lat2);

    // Haversine Formula
    const a =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.asin(Math.sqrt(a));

    let finalDistance = RADIUS_OF_EARTH_IN_KM * c;
    finalDistance /= 1.60934;

    console.log("haversineDistance -> finalDistance", finalDistance)

    if (finalDistance < miles) {
        return true
    } return false
    // return finalDistance

}  