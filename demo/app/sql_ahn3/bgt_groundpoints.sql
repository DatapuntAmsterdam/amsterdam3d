WITH
bounds AS (
  SELECT ST_MakeEnvelope(_west, _south, _east, _north, 28992) geom
),
pointcloud_unclassified AS(
  SELECT
    PC_FilterEquals(pa,'classification',2)
   pa
  FROM ahn3_pointcloud.patches, bounds
  WHERE ST_DWithin(geom, Geometry(pa),10) --patches should be INSIDE bounds
),
patches AS (
  SELECT a.pa FROM pointcloud_unclassified a
  --LIMIT 1000 --SAFETY
),
points AS (
  SELECT PC_Explode(pa) pt
  FROM patches
),
points_filtered AS (
  SELECT * FROM points WHERE random() > 0.2
)
SELECT nextval('counter') as id, 'ground' as type, '0.2 0.2 0.2' as color, ST_AsX3D(ST_Collect(Geometry(pt))) geom
FROM points_filtered a
GROUP BY PC_Get(pt,'classification');