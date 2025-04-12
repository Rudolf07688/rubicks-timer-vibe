import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './RubiksCube.css';

// Colors for the Rubik's cube faces - using more accurate colors
const COLORS = {
  white: new THREE.Color('#FFFFFF'),
  yellow: new THREE.Color('#FFDA00'),  // More accurate yellow
  green: new THREE.Color('#009B48'),   // More accurate green
  blue: new THREE.Color('#0045AD'),    // More accurate blue
  red: new THREE.Color('#B90000'),     // More accurate red
  orange: new THREE.Color('#FF5900'),  // More accurate orange
  black: new THREE.Color('#1A1A1A')    // Slightly lighter black for better contrast
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

// Main Rubik's Cube component - simplified to just show a solved cube
const RubiksCubeModel = () => {
  const groupRef = useRef();
  const [cubies, setCubies] = useState([]);
  
  // Create the solved state of the cube
  useEffect(() => {
    const newCubies = [];
    
    // Create a 3x3x3 cube
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip the center piece (internal)
          if (x === 0 && y === 0 && z === 0) continue;
          
          // Determine colors for each face - for a solved cube
          const colors = [
            x === 1 ? COLORS.red : COLORS.black,      // Right face (x+)
            x === -1 ? COLORS.orange : COLORS.black,  // Left face (x-)
            y === 1 ? COLORS.white : COLORS.black,    // Top face (y+)
            y === -1 ? COLORS.yellow : COLORS.black,  // Bottom face (y-)
            z === 1 ? COLORS.green : COLORS.black,    // Front face (z+)
            z === -1 ? COLORS.blue : COLORS.black     // Back face (z-)
          ];
          
          newCubies.push({
            id: `${x},${y},${z}`,
            position: [x, y, z],
            colors
          });
        }
      }
    }
    
    setCubies(newCubies);
  }, []);
  
  
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
const RubiksCube = ({ isRunning }) => {
  // Determine the CSS class based on whether the timer is running
  const containerClass = isRunning
    ? "rubiks-cube-container visible"
    : "rubiks-cube-container hidden";
  
  return (
    <div className={containerClass}>
      <Canvas camera={{ position: [4, 4, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <RubiksCubeModel />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default RubiksCube;