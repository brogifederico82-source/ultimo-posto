/*
Campus - nodi e way con nome che contiene LUISS, Pola, Parenzo, Heritz, Alberoni.
Bounding box (sud,ovest,nord,est): 41.9250,12.4950,41.9360,12.5100
Valori provvisori: da confermare sulla mappa prima del download.
Il filtro sul nome non distingue maiuscole/minuscole (flag ,i).
*/
[out:json][timeout:90];
(
  node["name"~"LUISS|Pola|Parenzo|Heritz|Alberoni",i](41.9250,12.4950,41.9360,12.5100);
  way["name"~"LUISS|Pola|Parenzo|Heritz|Alberoni",i](41.9250,12.4950,41.9360,12.5100);
);
out body geom;
