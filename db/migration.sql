-- 1. Rename Tables to align with the new 1-Land / 2-River concept
ALTER TABLE IF EXISTS elevation_primary RENAME TO land_data;
ALTER TABLE IF EXISTS river_data RENAME TO river_baseline;
ALTER TABLE IF EXISTS elevation_secondary RENAME TO river_current;

-- 2. Update Triggers for renamed tables
DROP TRIGGER IF EXISTS trg_populate_elevation_primary_geom ON land_data;
DROP TRIGGER IF EXISTS trg_populate_river_data_geom ON river_baseline;
DROP TRIGGER IF EXISTS trg_populate_elevation_secondary_geom ON river_current;

CREATE TRIGGER trg_populate_land_data_geom
BEFORE INSERT OR UPDATE ON land_data
FOR EACH ROW EXECUTE FUNCTION populate_elevation_geom();

CREATE TRIGGER trg_populate_river_baseline_geom
BEFORE INSERT OR UPDATE ON river_baseline
FOR EACH ROW EXECUTE FUNCTION populate_elevation_geom();

CREATE TRIGGER trg_populate_river_current_geom
BEFORE INSERT OR UPDATE ON river_current
FOR EACH ROW EXECUTE FUNCTION populate_elevation_geom();

-- 3. Recreate the Flood Risk View with Spatial Join Logic
-- Concept: Every land point calculates its risk relative to the nearest river nodes
DROP VIEW IF EXISTS flood_risk_view;

CREATE OR REPLACE VIEW flood_risk_view AS
SELECT 
    l.id,
    l.system_index as baseline_index, -- Keep names for frontend compatibility if needed
    'Current' as current_index,
    l.latitude,
    l.longitude,
    l.elevation as elevation_baseline, -- This is the land elevation
    COALESCE(rc.elevation, l.elevation) as elevation_current, -- This is the nearest river elevation
    (l.elevation - COALESCE(rc.elevation, l.elevation)) as river_clearance,
    (COALESCE(rb.elevation, rc.elevation, l.elevation) - COALESCE(rc.elevation, l.elevation)) as elevation_delta, -- Change in river level (impact on risk)
    COALESCE(ST_Distance(l.geom::geography, rc.geom::geography), 0.0) as distance_to_river_m,
    CASE 
        WHEN rc.id IS NULL THEN 'No Data'
        WHEN (l.elevation - rc.elevation) < 1.0 THEN 'High Risk (Red)'
        WHEN (l.elevation - rc.elevation) >= 1.0 AND (l.elevation - rc.elevation) <= 3.0 THEN 'Moderate Risk (Yellow)'
        ELSE 'Safe Zone (Green)'
    END as risk_status,
    CASE 
        WHEN rb.id IS NULL OR rc.id IS NULL THEN 'Stable'
        WHEN (rb.elevation - rc.elevation) > 0.5 THEN 'Worsened'
        WHEN (rb.elevation - rc.elevation) < -0.5 THEN 'Improved'
        ELSE 'Stable'
    END as change_analysis,
    l.geom
FROM land_data l
LEFT JOIN LATERAL (
    SELECT id, elevation, geom
    FROM river_current
    ORDER BY l.geom <-> geom
    LIMIT 1
) rc ON TRUE
LEFT JOIN LATERAL (
    SELECT id, elevation
    FROM river_baseline
    ORDER BY l.geom <-> geom
    LIMIT 1
) rb ON TRUE;

-- 4. Update RPC Functions
CREATE OR REPLACE FUNCTION clear_elevation_data()
RETURNS void AS $$
BEGIN
    TRUNCATE TABLE land_data CASCADE;
    TRUNCATE TABLE river_baseline CASCADE;
    TRUNCATE TABLE river_current CASCADE;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

CREATE OR REPLACE FUNCTION get_spatial_stats()
RETURNS TABLE (
    total_elevation_points BIGINT,
    total_river_points BIGINT,
    analyzed_area_km2 DOUBLE PRECISION
) AS $$
DECLARE
    all_points_geom GEOMETRY;
BEGIN
    SELECT ST_Collect(geom) INTO all_points_geom FROM (
        SELECT geom FROM (SELECT geom FROM land_data LIMIT 5000) p1
        UNION ALL
        SELECT geom FROM river_baseline
        UNION ALL
        SELECT geom FROM river_current
    ) sub;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM land_data) as total_elevation_points,
        (SELECT COUNT(*) FROM river_current) as total_river_points,
        COALESCE(ST_Area(ST_ConvexHull(all_points_geom)::geography) / 1000000.0, 0.0) as analyzed_area_km2;
END;
$$ LANGUAGE plpgsql;
