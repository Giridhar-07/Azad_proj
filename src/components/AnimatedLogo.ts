import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export class AnimatedLogo {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private container: HTMLElement;
  private particles!: THREE.Points;

  constructor() {
    this.container = document.getElementById('container')!;
    this.scene = new THREE.Scene();
    
    // Wait for container to have dimensions
    const width = this.container.clientWidth || 200; // Default width if not set
    const height = this.container.clientHeight || 60; // Default height if not set
    
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    this.initialize();
    this.createParticles();
    this.animate();
  }

  private initialize(): void {
    const width = this.container.clientWidth || 200;
    const height = this.container.clientHeight || 60;
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    this.container.appendChild(this.renderer.domElement);
    
    this.camera.position.z = 5;

    // Debounced resize handler
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => this.handleResize(), 100);
    });
  }

  private createParticles(): void {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    // Create particles in the shape of "AZAYD"
    const points = this.generateLogoPoints();
    
    for (const point of points) {
      vertices.push(point.x, point.y, point.z);
      colors.push(0.2, 0.5, 1); // Blue shade
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private generateLogoPoints(): { x: number, y: number, z: number }[] {
    const points: { x: number, y: number, z: number }[] = [];
    const letterSpacing = 0.5;
    let currentX = -2;

    // Helper function to generate letter points
    const generateLetterPoints = (
      xOffset: number, 
      count: number, 
      modifier?: (i: number) => { dx: number, dy: number }
    ) => {
      for (let i = 0; i < count; i++) {
        const base = {
          dx: Math.random() * 0.3,
          dy: Math.random() * 1
        };
        const { dx, dy } = modifier ? modifier(i) : base;
        
        points.push({
          x: xOffset + dx,
          y: dy,
          z: Math.random() * 0.1
        });
      }
      return letterSpacing;
    };

    // A
    currentX += generateLetterPoints(currentX, 20, (i) => ({
      dx: Math.sin(i / 20 * Math.PI) * 0.3,
      dy: Math.cos(i / 20 * Math.PI) * 0.5
    }));

    // Z
    currentX += generateLetterPoints(currentX, 20, (i) => ({
      dx: (i / 20) * 0.3,
      dy: 1 - (i / 20) * 1
    }));

    // A
    currentX += generateLetterPoints(currentX, 20, (i) => ({
      dx: Math.sin(i / 20 * Math.PI) * 0.3,
      dy: Math.cos(i / 20 * Math.PI) * 0.5
    }));

    // Y
    currentX += generateLetterPoints(currentX, 20, (i) => ({
      dx: Math.sin(i / 20 * Math.PI) * 0.3,
      dy: i < 10 ? Math.cos(i / 10 * Math.PI) * 0.5 : -0.5
    }));

    // D
    currentX += generateLetterPoints(currentX, 20, (i) => ({
      dx: Math.cos(i / 20 * Math.PI * 2) * 0.3,
      dy: Math.sin(i / 20 * Math.PI * 2) * 0.5
    }));

    return points;
  }

  private animate(): void {
    if (!this.container.isConnected) {
      // Stop animation if element is removed from DOM
      return;
    }

    requestAnimationFrame(() => this.animate());
    
    TWEEN.update();
    this.particles.rotation.y += 0.001;
    
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const width = this.container.clientWidth || 200;
    const height = this.container.clientHeight || 60;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}