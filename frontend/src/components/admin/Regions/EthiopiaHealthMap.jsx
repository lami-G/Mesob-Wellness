import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { MapContainer, GeoJSON, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { adminService } from "../../../services/adminService";
import "leaflet/dist/leaflet.css";
import styles from "./EthiopiaHealthMap.module.css";

/**
 * Component to handle map resize
 */
function MapResizeHandler() {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate size when component mounts
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Handle window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  
  return null;
}

/**
 * EthiopiaHealthMap Component
 * 
 * Displays an interactive map of Ethiopia using official GeoJSON boundaries.
 * Shows regional health data dynamically fetched from the backend.
 * Only regions that exist in the database are highlighted and interactive.
 * Responds to dashboard filters: timePeriod and selectedRegion.
 */
function EthiopiaHealthMap({ timePeriod = "monthly", selectedRegion = "all" }) {
  const [healthData, setHealthData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Database regions (only these should be interactive)
  const DATABASE_REGIONS = ["Tigray", "Amhara", "Oromia", "Addis Ababa"];

  // Fetch GeoJSON data
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        const response = await fetch("/eth_admin1.geojson");
        if (!response.ok) {
          throw new Error("Failed to load GeoJSON file");
        }
        const data = await response.json();
        setGeoJsonData(data);
      } catch (err) {
        console.error("Error loading GeoJSON:", err);
        setError("Failed to load map data");
      }
    };

    loadGeoJson();
  }, []);

  // Fetch health data with filter support
  const fetchHealthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get regional health data with time period filter
      const data = await adminService.getRegionalHealthComparison(timePeriod);
      
      // Apply region filter if specified
      let filteredData = data || [];
      
      if (selectedRegion && selectedRegion !== "all") {
        filteredData = filteredData.filter(region => 
          region.region.toLowerCase() === selectedRegion.toLowerCase()
        );
      }
      
      setHealthData(filteredData);
    } catch (err) {
      console.error("Error fetching health data:", err);
      setError(err.message || "Failed to load health data");
    } finally {
      setLoading(false);
    }
  }, [timePeriod, selectedRegion]);

  useEffect(() => {
    if (geoJsonData) {
      fetchHealthData();
    }
  }, [geoJsonData, fetchHealthData]);

  // Normalize region name for matching
  const normalizeRegionName = (name) => {
    if (!name) return "";
    return name.toLowerCase().trim().replace(/[\s-]/g, "");
  };

  // Match GeoJSON region with database region
  const matchRegionName = (geoJsonName) => {
    const normalized = normalizeRegionName(geoJsonName);
    
    return DATABASE_REGIONS.find(dbRegion => {
      const dbNormalized = normalizeRegionName(dbRegion);
      return normalized === dbNormalized || 
             normalized.includes(dbNormalized) || 
             dbNormalized.includes(normalized);
    });
  };

  // Get health data for a specific region
  const getRegionData = useCallback((regionName) => {
    if (!healthData || healthData.length === 0) return null;
    
    const matchedRegion = matchRegionName(regionName);
    if (!matchedRegion) return null;
    
    return healthData.find(d => 
      normalizeRegionName(d.region) === normalizeRegionName(matchedRegion)
    );
  }, [healthData]);

  // Check if region exists in database
  const isRegionInDatabase = useCallback((geoJsonRegionName) => {
    return matchRegionName(geoJsonRegionName) !== undefined;
  }, []);

  // Get color based on employee count
  const getRegionColor = useCallback((regionName) => {
    const matchedRegion = matchRegionName(regionName);
    if (!matchedRegion) return "#e5e7eb"; // Light gray for non-database regions
    
    const data = getRegionData(regionName);
    if (!data) return "#e5e7eb";
    
    const totalStaff = data.totalStaff || 0;
    
    // Color scale based on employee count
    if (totalStaff === 0) return "#94a3b8"; // Gray
    if (totalStaff >= 101) return "#ef4444"; // Critical - Red
    if (totalStaff >= 51) return "#f59e0b"; // Warning - Orange
    return "#10b981"; // Good - Green
  }, [getRegionData]);

  // Style for each GeoJSON feature
  const style = useCallback((feature) => {
    const regionName = feature.properties.adm1_name;
    const isInDatabase = isRegionInDatabase(regionName);
    const isHovered = hoveredRegion === regionName;
    
    return {
      fillColor: getRegionColor(regionName),
      fillOpacity: isInDatabase ? (isHovered ? 0.8 : 0.6) : 0.2,
      color: isInDatabase ? "#ffffff" : "#d1d5db",
      weight: isHovered ? 3 : 1.5,
      opacity: 1,
    };
  }, [getRegionColor, hoveredRegion, isRegionInDatabase]);

  // Event handlers for each region
  const onEachFeature = useCallback((feature, layer) => {
    const regionName = feature.properties.adm1_name;
    const isInDatabase = isRegionInDatabase(regionName);
    
    if (isInDatabase) {
      const matchedRegion = matchRegionName(regionName);
      const regionData = getRegionData(regionName);
      
      // Create tooltip content
      let tooltipContent = `<div class="${styles.leafletTooltip}">
        <div class="${styles.tooltipHeader}">${matchedRegion}</div>`;
      
      if (regionData) {
        tooltipContent += `<div class="${styles.tooltipRow}">Total Employees: ${regionData.totalStaff || 0}</div>`;
        
        if (regionData.conditions && Object.keys(regionData.conditions).length > 0) {
          tooltipContent += `<div class="${styles.tooltipSubheader}">Health Conditions</div>`;
          
          Object.entries(regionData.conditions)
            .filter(([_, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .forEach(([condition, count]) => {
              const formattedCondition = formatConditionName(condition);
              tooltipContent += `<div class="${styles.tooltipCondition}">• ${formattedCondition}: ${count}</div>`;
            });
        }
      } else {
        tooltipContent += `<div class="${styles.tooltipRow}">No data available</div>`;
      }
      
      tooltipContent += `</div>`;
      
      // Bind tooltip
      layer.bindTooltip(tooltipContent, {
        sticky: true,
        direction: "top",
        className: styles.customTooltip
      });
      
      // Mouse events
      layer.on({
        mouseover: (e) => {
          setHoveredRegion(regionName);
          layer.openTooltip();
        },
        mouseout: () => {
          setHoveredRegion(null);
          layer.closeTooltip();
        },
        click: () => {
          // Optional: Add click handler for region selection
          console.log("Clicked region:", matchedRegion);
        }
      });
    } else {
      // Non-interactive regions - just show name
      layer.bindTooltip(`<div class="${styles.leafletTooltip}">
        <div class="${styles.tooltipHeader}">${regionName}</div>
        <div class="${styles.tooltipRow}">Not in database</div>
      </div>`, {
        sticky: true,
        direction: "top",
        className: styles.customTooltip
      });
    }
  }, [getRegionData, isRegionInDatabase]);

  // Format condition names
  const formatConditionName = (condition) => {
    const conditionMap = {
      'hypertension': 'Hypertension',
      'diabetes': 'Diabetes',
      'obesity': 'Obesity',
      'overweight': 'Overweight',
      'asthma': 'Asthma',
      'heart_disease': 'Heart Disease',
      'respiratory': 'Respiratory',
      'heart_respiratory': 'Heart/Respiratory',
      'normal': 'Normal',
      'other': 'Other'
    };
    
    return conditionMap[condition] || condition.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Ethiopia bounds for map centering
  const ethiopiaBounds = [
    [3.4, 33.0],  // Southwest coordinates
    [14.9, 48.0]  // Northeast coordinates
  ];

  if (loading && !geoJsonData) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.error}>
          <p>⚠️ {error}</p>
          <button onClick={fetchHealthData} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!geoJsonData) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.error}>
          <p>⚠️ Map data not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <div className={styles.header}>
        <h3>Ethiopia Regional Map</h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: "#10b981" }} />
            <span>Good (0 - 50)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: "#f59e0b" }} />
            <span>Warning (51 - 100)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: "#ef4444" }} />
            <span>Critical (101 - 1,000+)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: "#e5e7eb" }} />
            <span>No Data</span>
          </div>
        </div>
      </div>

      <div className={styles.mapWrapper}>
        <MapContainer
          center={[9.145, 40.489673]}
          zoom={6}
          minZoom={5}
          maxZoom={9}
          style={{ height: "100%", width: "100%", background: "#f8fafc" }}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          zoomControl={false}
          className={styles.leafletContainer}
          bounds={ethiopiaBounds}
          boundsOptions={{ padding: [20, 20] }}
        >
          <MapResizeHandler />
          <ZoomControl position="topright" />
          
          {/* Optional: Add a subtle base map */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            opacity={0.3}
          />
          
          {/* GeoJSON layer with Ethiopia regions */}
          <GeoJSON
            data={geoJsonData}
            style={style}
            onEachFeature={onEachFeature}
            key={`geojson-${hoveredRegion}-${JSON.stringify(healthData)}`}
          />
        </MapContainer>
      </div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Updating data...</p>
        </div>
      )}
    </div>
  );
}

export default EthiopiaHealthMap;
