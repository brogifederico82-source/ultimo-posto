/*
Verde - Parioli, Viale Romania, Viale Pola, Via Parenzo.
Bounding box (sud,ovest,nord,est): 41.9250,12.4950,41.9360,12.5100
Valori provvisori: da confermare sulla mappa prima del download.
*/
[out:json][timeout:90];
(
  way["leisure"~"park|garden"](41.9250,12.4950,41.9360,12.5100);
  way["landuse"~"grass|recreation_ground"](41.9250,12.4950,41.9360,12.5100);
);
out body geom;
