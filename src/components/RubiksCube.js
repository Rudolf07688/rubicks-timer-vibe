import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './RubiksCube.css';

// Colors for the Rubik's cube faces
const COLORS = {
  white: new THREE.Color('#FFFFFF'),
  yellow: new THREE.Color('#FFFF00'),
  green: new THREE.Color('#00FF00'),
  blue: new THREE.Color('#0000FF'),
  red: new THREE.Color('#FF0000'),
  orange: new THREE.Color('#FFA500'),
  black: new THREE.Color('#000000')
};

// Individual cubie component
const Cubie = ({ position, colors, rotation }) => {
  const mesh = useRef();
  
  useEffect(() => {
    if (mesh.current && rotation) {
      mesh.current.rotation.x = rotation.x || 0;
      mesh.current.rotation.y = rotation.y || 0;
      mesh.current.rotation.z = rotation.z || 0;
    }
  }, [rotation]);

  return (
    <mesh ref={mesh} position={position}>
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

// Main Rubik's Cube component
const RubiksCubeModel = ({ isRunning, progress }) => {
  const groupRef = useRef();
  const [cubies, setCubies] = useState([]);
  const [animationStep, setAnimationStep] = useState(0);
  
  // Create the initial state of the cube
  useEffect(() => {
    const newCubies = [];
    
    // Create a 3x3x3 cube
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip the center piece (internal)
          if (x === 0 && y === 0 && z === 0) continue;
          
          // Determine colors for each face
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
            colors,
            rotation: { x: 0, y: 0, z: 0 }
          });
        }
      }
    }
    
    setCubies(newCubies);
  }, []);
  
  // Animation sequence - predefined moves to "solve" the cube
  const animationSequence = [
    // Each step is a move: { axis, layer, angle }
    { axis: 'y', layer: 1, angle: Math.PI/2 },   // Top layer clockwise
    { axis: 'x', layer: -1, angle: Math.PI/2 },  // Left layer up
    { axis: 'z', layer: 1, angle: Math.PI/2 },   // Front layer clockwise
    { axis: 'y', layer: -1, angle: Math.PI/2 },  // Bottom layer clockwise
    { axis: 'x', layer: 1, angle: Math.PI/2 },   // Right layer up
    { axis: 'z', layer: -1, angle: Math.PI/2 },  // Back layer clockwise
    // Add more moves as needed
  ];
  
  // Progress through animation based on timer progress
  useEffect(() => {
    if (isRunning && progress > 0) {
      // Map progress (0-1) to animation steps
      const step = Math.min(
        Math.floor(progress * animationSequence.length),
        animationSequence.length - 1
      );
      setAnimationStep(step);
    } else if (!isRunning) {
      // Reset animation when timer stops
      setAnimationStep(0);
    }
  }, [isRunning, progress, animationSequence.length]);
  
  // Apply the current animation step
  useEffect(() => {
    if (animationStep >= 0 && animationStep < animationSequence.length) {
      const move = animationSequence[animationStep];
      
      // Apply rotation to cubies in the specified layer
      setCubies(prevCubies => 
        prevCubies.map(cubie => {
          const [x, y, z] = cubie.position;
          
          // Check if this cubie is in the layer being rotated
          let inLayer = false;
          if (move.axis === 'x' && x === move.layer) inLayer = true;
          if (move.axis === 'y' && y === move.layer) inLayer = true;
          if (move.axis === 'z' && z === move.layer) inLayer = true;
          
          if (inLayer) {
            // Apply rotation based on the axis
            const rotation = { ...cubie.rotation };
            if (move.axis === 'x') rotation.x += move.angle;
            if (move.axis === 'y') rotation.y += move.angle;
            if (move.axis === 'z') rotation.z += move.angle;
            
            return { ...cubie, rotation };
          }
          
          return cubie;
        })
      );
    }
  }, [animationStep, animationSequence]);
  
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
          rotation={cubie.rotation}
        />
      ))}
    </group>
  );
};

// Wrapper component with Canvas
const RubiksCube = ({ isRunning, time }) => {
  // Calculate progress as a value between 0 and 1
  // Assuming a typical solve might take around 20 seconds
  const progress = Math.min(time / 20000, 1);
  
  // Determine the CSS class based on whether the timer is running
  const containerClass = isRunning
    ? "rubiks-cube-container visible"
    : "rubiks-cube-container hidden";
  
  return (
    <div className={containerClass}>
      <Canvas camera={{ position: [4, 4, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <RubiksCubeModel isRunning={isRunning} progress={progress} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default RubiksCube;