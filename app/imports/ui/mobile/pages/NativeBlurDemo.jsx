import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LiquidGlassBlur from '../liquidGlass/components/LiquidGlassBlur';
import LiquidGlassToolbar from '../liquidGlass/components/LiquidGlassToolbar';
import { useNativeBlur, useFloatingToolbar } from '../hooks/useNativeBlur';

/**
 * Demo component showcasing iOS 26 native blur and toolbar features
 * Demonstrates automatic fallback to CSS when native features are unavailable
 */
const NativeBlurDemo = () => {
  const [selectedBlur, setSelectedBlur] = useState('systemMaterial');
  const [showToolbar, setShowToolbar] = useState(true);
  const [blurIntensity, setBlurIntensity] = useState(1.0);
  
  const {
    isSupported: blurSupported,
    isLoading: blurLoading,
    getAvailableStyles
  } = useNativeBlur();
  
  const {
    isSupported: toolbarSupported,
    isLoading: toolbarLoading
  } = useFloatingToolbar();

  const [availableStyles, setAvailableStyles] = useState([]);

  useEffect(() => {
    if (blurSupported) {
      getAvailableStyles().then(setAvailableStyles).catch(() => {
        setAvailableStyles(['systemMaterial', 'light', 'dark']);
      });
    } else {
      setAvailableStyles(['light', 'dark', 'tinted']);
    }
  }, [blurSupported, getAvailableStyles]);

  const toolbarItems = [
    {
      type: 'button',
      icon: '🏠',
      title: 'Home',
      action: 'home'
    },
    {
      type: 'flexibleSpace'
    },
    {
      type: 'button',
      icon: '🔍',
      title: 'Search',
      action: 'search'
    },
    {
      type: 'button',
      icon: '⚙️',
      title: 'Settings',
      action: 'settings',
      primary: true
    }
  ];

  const handleToolbarAction = (item, index, action) => {
    console.log('Toolbar action:', { item, index, action });
    alert(`Pressed: ${item.title}`);
  };

  const handleBlurReady = ({ blurId, useNative }) => {
    console.log('Blur ready:', { blurId, useNative });
  };

  if (blurLoading || toolbarLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Initializing Native Features...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <DemoContainer>
      <BackgroundContent>
        <ContentGrid>
          {Array.from({ length: 20 }, (_, i) => (
            <ContentCard key={i}>
              <CardTitle>Card {i + 1}</CardTitle>
              <CardText>
                This is sample content to demonstrate the blur effect. 
                Native iOS 26 blur creates a beautiful frosted glass appearance.
              </CardText>
            </ContentCard>
          ))}
        </ContentGrid>
      </BackgroundContent>

      <StatusBar>
        <StatusItem>
          Native Blur: {blurSupported ? '✅ Supported' : '❌ CSS Fallback'}
        </StatusItem>
        <StatusItem>
          Native Toolbar: {toolbarSupported ? '✅ Supported' : '❌ CSS Fallback'}
        </StatusItem>
      </StatusBar>

      <ControlsContainer>
        <LiquidGlassBlur
          blurStyle={selectedBlur}
          intensity={blurIntensity}
          floating={true}
          onBlurReady={handleBlurReady}
        >
          <ControlsContent>
            <ControlGroup>
              <ControlLabel>Blur Style</ControlLabel>
              <StyleSelector>
                {availableStyles.map(style => (
                  <StyleButton
                    key={style}
                    active={selectedBlur === style}
                    onClick={() => setSelectedBlur(style)}
                  >
                    {style}
                  </StyleButton>
                ))}
              </StyleSelector>
            </ControlGroup>

            <ControlGroup>
              <ControlLabel>Intensity: {blurIntensity.toFixed(1)}</ControlLabel>
              <IntensitySlider
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={blurIntensity}
                onChange={(e) => setBlurIntensity(parseFloat(e.target.value))}
              />
            </ControlGroup>

            <ControlGroup>
              <ToolbarToggle
                active={showToolbar}
                onClick={() => setShowToolbar(!showToolbar)}
              >
                {showToolbar ? 'Hide Toolbar' : 'Show Toolbar'}
              </ToolbarToggle>
            </ControlGroup>
          </ControlsContent>
        </LiquidGlassBlur>
      </ControlsContainer>

      {showToolbar && (
        <LiquidGlassToolbar
          items={toolbarItems}
          position="bottom"
          floating={true}
          blurStyle={selectedBlur}
          onItemPress={handleToolbarAction}
          visible={showToolbar}
          animated={true}
        />
      )}
    </DemoContainer>
  );
};

// Styled components
const DemoContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
`;

const BackgroundContent = styled.div`
  padding: 20px;
  padding-bottom: 120px; /* Space for toolbar */
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CardTitle = styled.h3`
  color: white;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
`;

const CardText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
`;

const StatusBar = styled.div`
  position: fixed;
  top: env(safe-area-inset-top, 20px);
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 1001;
`;

const StatusItem = styled.div`
  background: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
`;

const ControlsContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 20px;
  right: 20px;
  transform: translateY(-50%);
  z-index: 999;
`;

const ControlsContent = styled.div`
  padding: 24px;
`;

const ControlGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ControlLabel = styled.label`
  display: block;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const StyleSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyleButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => props.active 
    ? 'rgba(0, 122, 255, 0.8)' 
    : 'rgba(0, 0, 0, 0.1)'
  };
  
  color: ${props => props.active 
    ? 'white' 
    : 'rgba(0, 0, 0, 0.7)'
  };
  
  &:hover {
    background: ${props => props.active 
      ? 'rgba(0, 122, 255, 1)' 
      : 'rgba(0, 0, 0, 0.2)'
    };
  }
`;

const IntensitySlider = styled.input`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 122, 255, 0.8);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const ToolbarToggle = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => props.active 
    ? 'rgba(255, 59, 48, 0.8)' 
    : 'rgba(0, 122, 255, 0.8)'
  };
  
  color: white;
  
  &:hover {
    background: ${props => props.active 
      ? 'rgba(255, 59, 48, 1)' 
      : 'rgba(0, 122, 255, 1)'
    };
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 500;
`;

export default NativeBlurDemo;
