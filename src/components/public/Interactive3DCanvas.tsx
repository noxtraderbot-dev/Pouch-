/**
 * True Three.js 3D Animated Canvas Component for JP MORGAN
 * Renders real-time 3D Three.js scenes:
 * 1. 'coin': 3D Metallic Piggy Bank with looping coin drop.
 * 2. 'vault': 3D Bank Vault Door with rotating locking wheel and spokes.
 * Visible immediately upon page load without user interaction.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Interactive3DCanvasProps {
  type: 'vault' | 'coin';
  className?: string;
}

export const Interactive3DCanvas: React.FC<Interactive3DCanvasProps> = ({ type, className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(type === 'coin' ? 0x090d16 : 0x020617);

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfbbf24, 2.5); // Warm gold light
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 2.0); // Cool blue fill light
    dirLight2.position.set(-5, -5, 3);
    scene.add(dirLight2);

    let animationFrameId: number;

    if (type === 'coin') {
      // --- 3D PIGGY BANK & COIN DROP SCENE ---
      
      // Piggy Bank Group
      const bankGroup = new THREE.Group();
      scene.add(bankGroup);

      // Body (Sphere scaled to ellipsoid)
      const bodyGeo = new THREE.SphereGeometry(1.4, 32, 32);
      bodyGeo.scale(1.2, 0.95, 1.0);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.8,
        roughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      bankGroup.add(body);

      // Snout
      const snoutGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.4, 32);
      snoutGeo.rotateX(Math.PI / 2);
      const snoutMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        metalness: 0.7,
        roughness: 0.3,
      });
      const snout = new THREE.Mesh(snoutGeo, snoutMat);
      snout.position.set(1.3, -0.1, 0);
      bankGroup.add(snout);

      // Coin Slot
      const slotGeo = new THREE.BoxGeometry(0.1, 0.4, 0.05);
      const slotMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(0, 1.35, 0);
      bankGroup.add(slot);

      // Coin Mesh
      const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 32);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        metalness: 0.9,
        roughness: 0.1,
      });
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.x = Math.PI / 2;
      scene.add(coin);

      let clock = 0;
      const animateCoin = () => {
        clock += 0.03;
        
        // Gentle floating rotation of piggy bank
        bankGroup.rotation.y = Math.sin(clock * 0.5) * 0.2;
        bankGroup.position.y = Math.sin(clock) * 0.05;

        // Looping coin drop (cycle 0 to 2 seconds)
        const cycle = (clock % 2) / 2;
        const startY = 3.5;
        const slotY = 1.38;

        if (cycle < 0.85) {
          coin.visible = true;
          coin.position.y = startY - cycle * (startY - slotY) * 1.15;
          coin.rotation.z = clock * 4;
          coin.scale.set(1, 1, 1);
        } else {
          // Drop inside
          coin.position.y = slotY - (cycle - 0.85) * 2;
          coin.scale.set(0.5, 0.5, 0.5);
          if (cycle > 0.95) coin.visible = false;
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animateCoin);
      };
      animateCoin();

    } else {
      // --- 3D BANK VAULT LOCKING WHEEL SCENE ---

      const vaultGroup = new THREE.Group();
      scene.add(vaultGroup);

      // Vault Door Base Circle
      const doorGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.3, 64);
      doorGeo.rotateX(Math.PI / 2);
      const doorMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.3,
      });
      const door = new THREE.Mesh(doorGeo, doorMat);
      vaultGroup.add(door);

      // Outer Steel Rim
      const rimGeo = new THREE.TorusGeometry(2.2, 0.15, 16, 64);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.95,
        roughness: 0.1,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      vaultGroup.add(rim);

      // Rotating Wheel Spokes Group
      const wheelGroup = new THREE.Group();
      vaultGroup.add(wheelGroup);

      // Center Hub
      const hubGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 32);
      hubGeo.rotateX(Math.PI / 2);
      const hubMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.8,
        roughness: 0.2,
      });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      wheelGroup.add(hub);

      // 4 Heavy Spokes / Handles
      const spokeCount = 4;
      for (let i = 0; i < spokeCount; i++) {
        const spokeGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 16);
        const spokeMat = new THREE.MeshStandardMaterial({
          color: 0x7dd3fc,
          metalness: 0.9,
          roughness: 0.2,
        });
        const spoke = new THREE.Mesh(spokeGeo, spokeMat);
        spoke.rotation.z = (i * Math.PI * 2) / spokeCount;
        wheelGroup.add(spoke);

        // Knob at the end of each spoke
        const knobGeo = new THREE.SphereGeometry(0.25, 16, 16);
        const knob = new THREE.Mesh(knobGeo, spokeMat);
        knob.position.y = 1.6;
        spoke.add(knob);
      }

      let clock = 0;
      const animateVault = () => {
        clock += 0.015;

        // Smooth continuous rotation of locking wheel
        wheelGroup.rotation.z = clock * 0.8;

        // Subtle door shift
        vaultGroup.rotation.y = Math.sin(clock * 0.5) * 0.1;
        vaultGroup.rotation.x = Math.cos(clock * 0.4) * 0.05;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animateVault);
      };
      animateVault();
    }

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [type]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden w-full h-full ${className}`} />
  );
};
