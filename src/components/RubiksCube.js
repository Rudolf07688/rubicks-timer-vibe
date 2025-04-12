import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './RubiksCube.css';

// Colors for the Rubik's cube faces - using accurate colors
const COLORS = {
  white: new THREE.Color('#FFFFFF'),
  yellow: new THREE.Color('#FFDA00'),  // More accurate yellow
  green: new THREE.Color('#009B48'),   // More accurate green
  blue: new THREE.Color('#0045AD'),    // More accurate blue
  red: new THREE.Color('#B90000'),     // More accurate red
  orange: new THREE.Color('#FF5900'),  // More accurate orange
  // Use dark gray for internal faces instead of black
  internal: new THREE.Color('#333333')
};

// Individual cubie component
const Cubie = ({ position, colors }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      <meshStandardMaterial attach="material-0" color={colors[0]} /> {/* Right */}
      <meshStandardMaterial attach="material-1" color={colors[1]} /> {/* Left */}
      <meshStandardMaterial attach="material-2" color={colors[2]} /> {/* Top */}
      <meshStandardMaterial attach="material-3" color={colors[3]} /> {/* Bottom */}
      <meshStandardMaterial attach="material-4" color={colors[4]} /> {/* Front */}
      <meshStandardMaterial attach="material-5" color={colors[5]} /> {/* Back */}
    </mesh>
  );
};

// Helper function to parse scramble notation and apply to cube state
const applyScrambleToState = (scramble, initialCubies) => {
  if (!scramble || !initialCubies || initialCubies.length === 0) {
    return initialCubies;
  }
  
  // Clone the initial cubies to avoid mutating the original
  let cubies = JSON.parse(JSON.stringify(initialCubies));
  
  // Parse the scramble string into individual moves
  const moves = scramble.split(' ').filter(move => move.trim() !== '');
  
  // Apply each move to the cube state
  moves.forEach(moveNotation => {
    // Parse the move notation (e.g., "R", "U'", "F2")
    const face = moveNotation.charAt(0);
    const modifier = moveNotation.substring(1); // '', "'", or "2"
    
    // Determine the axis and layer based on the face
    let axis, layer, direction;
    
    switch (face) {
      case 'R': // Right face
        axis = 'x';
        layer = 1;
        direction = modifier === "'" ? -1 : 1;
        break;
      case 'L': // Left face
        axis = 'x';
        layer = -1;
        direction = modifier === "'" ? 1 : -1;
        break;
      case 'U': // Up face
        axis = 'y';
        layer = 1;
        direction = modifier === "'" ? -1 : 1;
        break;
      case 'D': // Down face
        axis = 'y';
        layer = -1;
        direction = modifier === "'" ? 1 : -1;
        break;
      case 'F': // Front face
        axis = 'z';
        layer = 1;
        direction = modifier === "'" ? -1 : 1;
        break;
      case 'B': // Back face
        axis = 'z';
        layer = -1;
        direction = modifier === "'" ? 1 : -1;
        break;
      default:
        return; // Skip invalid moves
    }
    
    // Determine how many quarter turns to make
    const turns = modifier === "2" ? 2 : 1;
    
    // Apply the move to the cube
    for (let t = 0; t < turns; t++) {
      cubies = rotateFace(cubies, axis, layer, direction);
    }
  });
  
  return cubies;
};

// Function to rotate a face of the cube
const rotateFace = (cubies, axis, layer, direction) => {
  // Find cubies in the layer to rotate
  const layerCubies = cubies.filter(cubie => {
    const [x, y, z] = cubie.position;
    if (axis === 'x' && Math.round(x) === layer) return true;
    if (axis === 'y' && Math.round(y) === layer) return true;
    if (axis === 'z' && Math.round(z) === layer) return true;
    return false;
  });
  
  // Rotate the positions of the cubies in the layer
  layerCubies.forEach(cubie => {
    const [x, y, z] = cubie.position;
    
    // Apply rotation based on axis
    if (axis === 'x') {
      // Rotate around x-axis
      const newY = direction * z;
      const newZ = -direction * y;
      cubie.position = [x, newY, newZ];
      
      // Rotate the colors (swap top/bottom/front/back)
      const colors = [...cubie.colors];
      if (direction > 0) {
        // Clockwise rotation
        [colors[2], colors[4], colors[3], colors[5]] = [colors[5], colors[2], colors[4], colors[3]];
      } else {
        // Counter-clockwise rotation
        [colors[2], colors[4], colors[3], colors[5]] = [colors[4], colors[3], colors[5], colors[2]];
      }
      cubie.colors = colors;
    } else if (axis === 'y') {
      // Rotate around y-axis
      const newX = direction * z;
      const newZ = -direction * x;
      cubie.position = [newX, y, newZ];
      
      // Rotate the colors (swap right/front/left/back)
      const colors = [...cubie.colors];
      if (direction > 0) {
        // Clockwise rotation
        [colors[0], colors[4], colors[1], colors[5]] = [colors[5], colors[0], colors[4], colors[1]];
      } else {
        // Counter-clockwise rotation
        [colors[0], colors[4], colors[1], colors[5]] = [colors[4], colors[1], colors[5], colors[0]];
      }
      cubie.colors = colors;
    } else if (axis === 'z') {
      // Rotate around z-axis
      const newX = -direction * y;
      const newY = direction * x;
      cubie.position = [newX, newY, z];
      
      // Rotate the colors (swap right/top/left/bottom)
      const colors = [...cubie.colors];
      if (direction > 0) {
        // Clockwise rotation
        [colors[0], colors[2], colors[1], colors[3]] = [colors[3], colors[0], colors[2], colors[1]];
      } else {
        // Counter-clockwise rotation
        [colors[0], colors[2], colors[1], colors[3]] = [colors[2], colors[1], colors[3], colors[0]];
      }
      cubie.colors = colors;
    }
  });
  
  return cubies;
};

// Main Rubik's Cube component - shows a cube with the scramble applied
const RubiksCubeModel = ({ scramble }) => {
  const groupRef = useRef();
  const [cubies, setCubies] = useState([]);
  
  const [initialCubies, setInitialCubies] = useState([]);
  
  // Create the initial solved state of the cube
  useEffect(() => {
    const newCubies = [];
    
    // Create a 3x3x3 cube
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip the center piece (internal)
          if (x === 0 && y === 0 && z === 0) continue;
          
          // Determine colors for each face - for a solved cube
          // Use the actual colors for all faces, not black for internal faces
          const colors = [
            x === 1 ? COLORS.red : (x === -1 ? COLORS.orange : COLORS.internal),    // Right/Left face
            x === -1 ? COLORS.orange : (x === 1 ? COLORS.red : COLORS.internal),    // Left/Right face
            y === 1 ? COLORS.white : (y === -1 ? COLORS.yellow : COLORS.internal),  // Top/Bottom face
            y === -1 ? COLORS.yellow : (y === 1 ? COLORS.white : COLORS.internal),  // Bottom/Top face
            z === 1 ? COLORS.green : (z === -1 ? COLORS.blue : COLORS.internal),    // Front/Back face
            z === -1 ? COLORS.blue : (z === 1 ? COLORS.green : COLORS.internal)     // Back/Front face
          ];
          
          newCubies.push({
            id: `${x},${y},${z}`,
            position: [x, y, z],
            colors
          });
        }
      }
    }
    
    setInitialCubies(newCubies);
  }, []);
  
  // Apply scramble to the cube
  useEffect(() => {
    if (initialCubies.length > 0) {
      const scrambledCubies = applyScrambleToState(scramble, initialCubies);
      setCubies(scrambledCubies);
    }
  }, [scramble, initialCubies]);
  
  
  // Rotate the entire cube slowly
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.x += 0.002;
    }
  });
  
  return (
    <group ref={groupRef}>
      {cubies.map(cubie => (
        <Cubie
          key={cubie.id}
          position={cubie.position}
          colors={cubie.colors}
        />
      ))}
    </group>
  );
};

// Wrapper component with Canvas
const RubiksCube = ({ isRunning, scramble }) => {
  // Determine the CSS class based on whether the timer is running
  const containerClass = isRunning
    ? "rubiks-cube-container visible"
    : "rubiks-cube-container hidden";
  
  return (
    <div className={containerClass}>
      <Canvas camera={{ position: [4, 4, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <RubiksCubeModel scramble={scramble} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default RubiksCube;