import React, { useState } from "react";
import MapView from "../components/MapView";
import InteractiveMapPicker from "../components/InteractiveMapPicker";
import LiquidGlassButton from "../components/LiquidGlassButton";
import {
  Container,
  Header,
  AppName,
  Content,
  Copy,
  Title,
  Subtitle,
  Section,
  SectionTitle,
  SectionContent,
  ComponentContainer,
  ControlsGrid,
  ControlItem,
  Label,
  Input,
  InfoCard,
  InfoItem,
  InfoLabel,
  InfoValue,
} from "../styles/TestMapView";

/**
 * Test page for MapView component - Admin only
 */
const MobileTestMapView = () => {
  const [coordinates, setCoordinates] = useState([
    { lat: 49.345196, lng: -123.149805, label: "Vancouver" },
    { lat: 49.35, lng: -123.155, label: "Point 2" },
    { lat: 49.34, lng: -123.145, label: "Point 3" },
  ]);
  const [tileServerUrl, setTileServerUrl] = useState("");
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 49.345196,
    lng: -123.149805,
  });
  const [mapPickerHeight, setMapPickerHeight] = useState("400px");
  const [newPointLat, setNewPointLat] = useState("");
  const [newPointLng, setNewPointLng] = useState("");
  const [newPointLabel, setNewPointLabel] = useState("");
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleAddPoint = () => {
    const lat = parseFloat(newPointLat);
    const lng = parseFloat(newPointLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      setCoordinates([
        ...coordinates,
        {
          lat,
          lng,
          label: newPointLabel || `Point ${coordinates.length + 1}`,
        },
      ]);
      setNewPointLat("");
      setNewPointLng("");
      setNewPointLabel("");
    }
  };

  const handleRemovePoint = (index) => {
    setCoordinates(coordinates.filter((_, i) => i !== index));
  };

  const handleClearPoints = () => {
    setCoordinates([]);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - backgroundPosition.x,
      y: e.clientY - backgroundPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setBackgroundPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - backgroundPosition.x,
      y: touch.clientY - backgroundPosition.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    setBackgroundPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <Container>
      <Header>
        <AppName>MapView Test</AppName>
      </Header>

      <Content>
        <Copy>
          <Title>Test MapView Component</Title>
          <Subtitle>
            Interactive testing page for the MapView component with Leaflet.js
            integration
          </Subtitle>
        </Copy>

        <Section>
          <SectionTitle>🗺️ Map Component</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <Label htmlFor="newPointLat">Add Point - Latitude</Label>
                <Input
                  id="newPointLat"
                  type="number"
                  step="0.000001"
                  value={newPointLat}
                  onChange={(e) => setNewPointLat(e.target.value)}
                  placeholder="Enter latitude"
                />
              </ControlItem>
              <ControlItem>
                <Label htmlFor="newPointLng">Add Point - Longitude</Label>
                <Input
                  id="newPointLng"
                  type="number"
                  step="0.000001"
                  value={newPointLng}
                  onChange={(e) => setNewPointLng(e.target.value)}
                  placeholder="Enter longitude"
                />
              </ControlItem>
            </ControlsGrid>

            <ControlsGrid>
              <ControlItem>
                <Label htmlFor="newPointLabel">
                  Add Point - Label (optional)
                </Label>
                <Input
                  id="newPointLabel"
                  type="text"
                  value={newPointLabel}
                  onChange={(e) => setNewPointLabel(e.target.value)}
                  placeholder="Enter point label"
                />
              </ControlItem>
              <ControlItem>
                <Label>Actions</Label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <LiquidGlassButton
                    label="Add Point"
                    onClick={handleAddPoint}
                  />
                  <LiquidGlassButton
                    label="Clear All"
                    onClick={handleClearPoints}
                  />
                </div>
              </ControlItem>
            </ControlsGrid>

            <ControlItem>
              <Label htmlFor="tileServer">
                Self-hosted Tile Server URL (optional)
              </Label>
              <Input
                id="tileServer"
                type="text"
                value={tileServerUrl}
                onChange={(e) => setTileServerUrl(e.target.value)}
                placeholder="http://localhost:8080 or http://your-tiles-server.com"
              />
            </ControlItem>

            <ComponentContainer>
              <MapView
                coordinates={coordinates}
                tileServerUrl={tileServerUrl || undefined}
              />
            </ComponentContainer>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Current Points</InfoLabel>
                <InfoValue>
                  {coordinates.length} point(s) displayed
                  {coordinates.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      {coordinates.map((coord, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          }}
                        >
                          <span>
                            {coord.label}: {coord.lat.toFixed(6)},{" "}
                            {coord.lng.toFixed(6)}
                          </span>
                          <button
                            onClick={() => handleRemovePoint(index)}
                            style={{
                              padding: "2px 6px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "2px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Component Size</InfoLabel>
                <InfoValue>376px × 272px</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Map Source</InfoLabel>
                <InfoValue>
                  {tileServerUrl ? "Self-hosted tiles" : "Tileserver proxy"}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Features</InfoLabel>
                <InfoValue>
                  Interactive Leaflet map with markers and popups
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>✨ LiquidGlassButton Test</SectionTitle>
          <SectionContent>
            <InfoCard>
              <InfoItem>
                <InfoLabel>Component Test</InfoLabel>
                <InfoValue>
                  Testing the LiquidGlassButton component with different labels
                  and actions
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <ControlsGrid>
              <ControlItem>
                <Label>Background Control</Label>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <LiquidGlassButton
                    label="Reset Pattern"
                    onClick={() => setBackgroundPosition({ x: 0, y: 0 })}
                  />
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    Drag the background to test glass effect
                  </span>
                </div>
              </ControlItem>
              <ControlItem>
                <Label>Sample Buttons</Label>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    padding: "40px 20px",
                    background: `linear-gradient(45deg,
                      transparent 45%,
                      #007bff 47%,
                      #007bff 53%,
                      transparent 55%),
                      linear-gradient(-45deg,
                      transparent 45%,
                      #28a745 47%,
                      #28a745 53%,
                      transparent 55%),
                      linear-gradient(0deg,
                      #f8f9fa 0%,
                      #e9ecef 100%)`,
                    backgroundSize: "30px 30px, 30px 30px, 100% 100%",
                    backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px, ${backgroundPosition.x}px ${backgroundPosition.y}px, 0 0`,
                    borderRadius: "8px",
                    position: "relative",
                    cursor: isDragging ? "grabbing" : "grab",
                    userSelect: "none",
                    touchAction: "none",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <LiquidGlassButton
                    label="Sample Action"
                    onClick={() => alert("LiquidGlassButton clicked!")}
                  />
                  <LiquidGlassButton
                    label="Test Button"
                    onClick={() => console.log("Test button pressed")}
                  />
                  <LiquidGlassButton
                    label="Glass Effect"
                    onClick={() => alert("Glass effect working!")}
                  />
                </div>
              </ControlItem>
            </ControlsGrid>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 LiquidGlassButton Features & Testing</InfoLabel>
                <InfoValue>
                  1. Liquid glass visual effect with multiple layers
                  <br />
                  2. Blur effects and glass-like transparency
                  <br />
                  3. Interactive hover and click states
                  <br />
                  4. Customizable label text
                  <br />
                  5. Smooth animations and transitions
                  <br />
                  6. Modern design with glass morphism style
                  <br />
                  7. 🖱️ <strong>Drag the background</strong> to test
                  transparency effect
                  <br />
                  8. Use "Reset Pattern" button to center the background
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>🎯 Interactive Map Picker</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <Label htmlFor="mapHeight">Map Height</Label>
                <Input
                  id="mapHeight"
                  type="text"
                  value={mapPickerHeight}
                  onChange={(e) => setMapPickerHeight(e.target.value)}
                  placeholder="e.g., 400px, 50vh"
                />
              </ControlItem>
              <ControlItem>
                <Label>Reset to Default Location</Label>
                <LiquidGlassButton
                  label="Reset to Vancouver"
                  onClick={() =>
                    setSelectedLocation({ lat: 49.345196, lng: -123.149805 })
                  }
                />
              </ControlItem>
            </ControlsGrid>

            <ComponentContainer>
              <InteractiveMapPicker
                initialLat={selectedLocation.lat}
                initialLng={selectedLocation.lng}
                onLocationSelect={(location) => {
                  setSelectedLocation(location);
                  console.log("Location selected:", location);
                }}
                selectedLocation={selectedLocation}
                height={mapPickerHeight}
              />
            </ComponentContainer>

            <InfoCard>
              <InfoItem>
                <InfoLabel>Selected Coordinates</InfoLabel>
                <InfoValue>
                  {selectedLocation.lat.toFixed(6)},{" "}
                  {selectedLocation.lng.toFixed(6)}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Coordinate String</InfoLabel>
                <InfoValue>
                  {selectedLocation.lat},{selectedLocation.lng}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Map Height</InfoLabel>
                <InfoValue>{mapPickerHeight}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Features</InfoLabel>
                <InfoValue>
                  Click to select, drag marker, search locations, GPS center
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Tile Source</InfoLabel>
                <InfoValue>Tileserver proxy (/tileserver/...)</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Geocoding</InfoLabel>
                <InfoValue>
                  TileServer GL (local) with Nominatim fallback
                </InfoValue>
              </InfoItem>
            </InfoCard>

            <InfoCard>
              <InfoItem>
                <InfoLabel>🧪 Test Instructions</InfoLabel>
                <InfoValue>
                  1. Search for a location (e.g., "Central Park, New York")
                  <br />
                  2. Click anywhere on the map to select coordinates
                  <br />
                  3. Drag the red marker to fine-tune position
                  <br />
                  4. Use zoom controls (+/-) to change map scale
                  <br />
                  5. Click GPS button (📍) to center on your location
                  <br />
                  6. Try different map heights in the control above
                  <br />
                  7. Check browser console for location selection events
                </InfoValue>
              </InfoItem>
            </InfoCard>
          </SectionContent>
        </Section>
      </Content>
    </Container>
  );
};

export default MobileTestMapView;
