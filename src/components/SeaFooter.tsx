import React, { useEffect, useRef, useState } from 'react';

declare const THREE: any;

export const SeaFooter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(60);
  const [drifting, setDrifting] = useState(true);
  const [testTimeIndex, setTestTimeIndex] = useState(0); // 0: Auto, 1: Morning, 2: Midday, 3: Golden, 4: Dusk, 5: Night
  const [weather, setWeather] = useState<'CLEAR' | 'RAIN'>('CLEAR');
  const [timeLabel, setTimeLabel] = useState('GOLDEN HOUR');
  const [timeOfDay, setTimeOfDay] = useState(75);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!containerRef.current || typeof THREE === 'undefined') return;

    const seaContainer = containerRef.current;
    let seaScene: any, seaCamera: any, seaRenderer: any;
    let water: any, sun: any, sky: any;
    let rain: any, shipGroup: any;
    let seaTime = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    let isSeaActive = true;
    let animationFrameId: number;

    function initSea() {
      seaRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      seaRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize pixel ratio
      seaRenderer.setSize(seaContainer.clientWidth, seaContainer.clientHeight);
      seaRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      seaRenderer.toneMappingExposure = 0.5;
      seaContainer.appendChild(seaRenderer.domElement);

      seaScene = new THREE.Scene();
      seaScene.fog = new THREE.FogExp2(0x001e0f, 0.001);

      seaCamera = new THREE.PerspectiveCamera(55, seaContainer.clientWidth / seaContainer.clientHeight, 1, 20000);
      seaCamera.position.set(0, 30, 100);

      sun = new THREE.Vector3();

      const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
      
      water = new THREE.Water(
        waterGeometry,
        {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/waternormals.jpg', function ( texture: any ) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }),
          sunDirection: new THREE.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: seaScene.fog !== undefined
        }
      );
      water.rotation.x = - Math.PI / 2;
      seaScene.add(water);

      sky = new THREE.Sky();
      sky.scale.setScalar(10000);
      seaScene.add(sky);

      const skyUniforms = sky.material.uniforms;
      skyUniforms[ 'turbidity' ].value = 10;
      skyUniforms[ 'rayleigh' ].value = 2;
      skyUniforms[ 'mieCoefficient' ].value = 0.005;
      skyUniforms[ 'mieDirectionalG' ].value = 0.8;

      // Rain Particles using LineSegments for realistic streaks
      const RAIN_COUNT = 1500; // 1500 lines = 3000 points
      const rainGeo = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(RAIN_COUNT * 2 * 3);
      for(let i=0; i<RAIN_COUNT; i++){
        const x = (Math.random() - 0.5) * 400;
        const y = Math.random() * 200;
        const z = (Math.random() - 0.5) * 200;
        
        // Start vertex of line
        rainPositions[i*6] = x;
        rainPositions[i*6+1] = y;
        rainPositions[i*6+2] = z;
        
        // End vertex of line (slightly below)
        rainPositions[i*6+3] = x;
        rainPositions[i*6+4] = y - 5;
        rainPositions[i*6+5] = z;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.LineBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.5
      });
      rain = new THREE.LineSegments(rainGeo, rainMat);
      rain.visible = false;
      seaScene.add(rain);

      // Simple Ship
      shipGroup = new THREE.Group();
      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(15, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0x2a1d0d })
      );
      hull.position.y = 1.5;
      const sail = new THREE.Mesh(
        new THREE.ConeGeometry(4, 15, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      sail.position.y = 10;
      shipGroup.add(hull);
      shipGroup.add(sail);
      shipGroup.position.set(-200, 0, 0); // Brought closer
      seaScene.add(shipGroup);

      // Ambient light for ship
      const ambientLight = new THREE.AmbientLight(0x404040);
      seaScene.add(ambientLight);

      window.addEventListener('resize', onSeaWindowResize);
      seaAnimate();
    }

    function onSeaWindowResize() {
      if(!seaCamera || !seaRenderer || !seaContainer) return;
      seaCamera.aspect = seaContainer.clientWidth / seaContainer.clientHeight;
      seaCamera.updateProjectionMatrix();
      seaRenderer.setSize(seaContainer.clientWidth, seaContainer.clientHeight);
    }

    function seaAnimate() {
      if (!isSeaActive) return;
      animationFrameId = requestAnimationFrame(seaAnimate);
      
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Time increment - Fixed roughly for 60fps
      seaTime += (1.0 / 60.0) * (window as any)._seaSpeed;
      
      if (water) {
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0 * (window as any)._seaSpeed;
      }

      if ((window as any)._isDrifting) {
        seaCamera.position.y = 30 + Math.sin(seaTime * 2) * 2;
      } else {
        seaCamera.position.y = 30; // reset
      }

      if ((window as any)._rain && (window as any)._rain.visible) {
        const positions = (window as any)._rain.geometry.attributes.position.array;
        for(let i=0; i<1500; i++) {
          const idxStart = i * 6;
          const idxEnd = i * 6 + 3;
          
          positions[idxStart+1] -= 10; // Fall speed Y
          positions[idxEnd+1] -= 10;
          
          // Reset when falling below sea level
          if (positions[idxStart+1] < 0) {
            positions[idxStart+1] = 200;
            positions[idxEnd+1] = 195;
            
            // Randomize X and Z slightly on reset
            const newX = (Math.random() - 0.5) * 400;
            const newZ = (Math.random() - 0.5) * 200;
            positions[idxStart] = newX;
            positions[idxEnd] = newX;
            positions[idxStart+2] = newZ;
            positions[idxEnd+2] = newZ;
          }
        }
        (window as any)._rain.geometry.attributes.position.needsUpdate = true;
      }

      if ((window as any)._ship) {
        (window as any)._ship.position.x += 0.1 * (window as any)._seaSpeed;
        (window as any)._ship.position.y = Math.sin(seaTime * 3) * 0.8;
        (window as any)._ship.rotation.z = Math.sin(seaTime * 2) * 0.05;
        (window as any)._ship.rotation.x = Math.sin(seaTime * 1.5) * 0.05;
        if ((window as any)._ship.position.x > 200) {
          (window as any)._ship.position.x = -200;
        }
      }

      // Lightning animation
      if ((window as any)._weather === 'RAIN' && Math.random() < 0.005) {
        (window as any)._lightningTime = now;
      }

      let currentExposure = (window as any)._baseExposure || 0.5;
      if ((window as any)._weather === 'RAIN' && (window as any)._lightningTime) {
        const elapsed = now - (window as any)._lightningTime;
        if (elapsed < 400) {
          // Double flash pattern
          if (elapsed < 60 || (elapsed > 120 && elapsed < 180)) {
            currentExposure += 2.0; // bright flash!
          }
        }
      }
      seaRenderer.toneMappingExposure = currentExposure;

      seaRenderer.render(seaScene, seaCamera);
    }

    (window as any)._seaSpeed = 1.0;
    (window as any)._isDrifting = true;
    (window as any)._weather = 'CLEAR';

    initSea();

    (window as any)._seaInstances = { seaRenderer, sky, water, sun, rain, shipGroup };

    return () => {
      isSeaActive = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onSeaWindowResize);
      if (seaRenderer && seaRenderer.domElement && seaContainer.contains(seaRenderer.domElement)) {
        seaContainer.removeChild(seaRenderer.domElement);
      }
    };
  }, []);

  // Update Sun when timeOfDay changes
  useEffect(() => {
    const inst = (window as any)._seaInstances;
    if (!inst) return;
    const val = timeOfDay;
    let elevation;
    let label = "DAY";
    
    if (val < 20) {
      elevation = -2; label = "NIGHT";
      (window as any)._baseExposure = 0.1;
      inst.water.material.uniforms['sunColor'].value.setHex(0x222244);
      inst.water.material.uniforms['waterColor'].value.setHex(0x000508);
    } else if (val < 45) {
      elevation = 5 + (val-20); label = "MORNING";
      (window as any)._baseExposure = 0.3;
      inst.water.material.uniforms['sunColor'].value.setHex(0xffeebb);
      inst.water.material.uniforms['waterColor'].value.setHex(0x001e0f);
    } else if (val < 65) {
      elevation = 45; label = "MIDDAY";
      (window as any)._baseExposure = 0.5;
      inst.water.material.uniforms['sunColor'].value.setHex(0xffffff);
      inst.water.material.uniforms['waterColor'].value.setHex(0x001e0f);
    } else if (val < 85) {
      elevation = Math.max(0.5, 10 - (val-65)*0.5); label = "GOLDEN HOUR";
      (window as any)._baseExposure = 0.4;
      inst.water.material.uniforms['sunColor'].value.setHex(0xff8833);
      inst.water.material.uniforms['waterColor'].value.setHex(0x001e0f);
    } else {
      elevation = -1; label = "DUSK";
      (window as any)._baseExposure = 0.2;
      inst.water.material.uniforms['sunColor'].value.setHex(0x884422);
      inst.water.material.uniforms['waterColor'].value.setHex(0x000a12);
    }
    
    setTimeLabel(label);

    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(180);

    inst.sun.setFromSphericalCoords(1, phi, theta);

    inst.sky.material.uniforms[ 'sunPosition' ].value.copy(inst.sun);
    inst.water.material.uniforms[ 'sunDirection' ].value.copy(inst.sun).normalize();
  }, [timeOfDay]);

  // Update Weather state
  useEffect(() => {
    const inst = (window as any)._seaInstances;
    if (!inst) return;
    (window as any)._weather = weather;
    if (weather === 'RAIN') {
      inst.rain.visible = true;
      inst.water.material.uniforms[ 'distortionScale' ].value = 5.0;
      (window as any)._seaSpeed = 1.5;
      inst.sky.material.uniforms[ 'turbidity' ].value = 20;
    } else {
      inst.rain.visible = false;
      inst.water.material.uniforms[ 'distortionScale' ].value = 3.7;
      (window as any)._seaSpeed = 1.0;
      inst.sky.material.uniforms[ 'turbidity' ].value = 10;
    }
  }, [weather]);

  // Update Drifting
  useEffect(() => {
    (window as any)._isDrifting = drifting;
  }, [drifting]);

  // Live Clock & Sync
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      let val = 0;
      if (testTimeIndex === 0) {
        // Auto
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        val = (hour + minute / 60 + second / 3600) / 24 * 100;
      } else if (testTimeIndex === 1) val = 30; // Morning
      else if (testTimeIndex === 2) val = 55; // Midday
      else if (testTimeIndex === 3) val = 75; // Golden Hour
      else if (testTimeIndex === 4) val = 90; // Dusk
      else if (testTimeIndex === 5) val = 10; // Night
      
      setTimeOfDay(val);
    }, 1000);
    return () => clearInterval(timer);
  }, [testTimeIndex]);


  return (
    <div className="relative w-full h-[100vh] z-[9] overflow-hidden pointer-events-none font-sans group">
      <style>{`
        .sea-ui {
          position: absolute;
          bottom: 15px;
          top: auto;
          left: 15px;
          width: 320px;
          background: rgba(30, 25, 30, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          color: rgba(255,255,255,0.9);
          pointer-events: auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          transform: scale(0.7);
          transform-origin: bottom left;
        }
        @media (min-width: 640px) {
          .sea-ui {
            padding: 24px;
            transform: scale(0.75);
            bottom: 30px;
          }
        }
      `}</style>
      
      <div ref={containerRef} className="absolute top-0 left-0 w-full h-full pointer-events-auto" />
      
      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 px-4 transition-opacity duration-1000">
        <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white/90 font-orbitron tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] mb-6">
          I LOVE SUNSETS
        </h2>
        <p className="text-sm md:text-lg lg:text-xl font-mono text-white/80 max-w-2xl leading-relaxed tracking-wide drop-shadow-md">
          "Sunsets are proof that no matter what happens, every day can end beautifully."
        </p>
      </div>
      
      <div className="sea-ui">
        <div className="text-[9px] tracking-[3px] text-white/50 mb-1.5 uppercase font-semibold">Realtime Ocean</div>
        <div className="text-2xl font-bold tracking-[2px] mb-1.5">OPEN SEA</div>
        <div className="text-[11px] text-white/40 mb-6 font-mono tracking-wide">Gerstner swell · FBM micro-surface</div>

        <div className="mb-5 flex gap-2">
          <button 
            onClick={() => setTestTimeIndex((prev) => (prev + 1) % 6)}
            className="flex-1 px-3 py-2 rounded-md text-[10px] tracking-[1.5px] uppercase font-semibold transition-all border border-[#7fffd4]/30 text-[#7fffd4] hover:bg-[#7fffd4]/10"
          >
            Time: {testTimeIndex === 0 ? 'AUTO' : testTimeIndex === 1 ? 'MORNING' : testTimeIndex === 2 ? 'MIDDAY' : testTimeIndex === 3 ? 'GOLDEN' : testTimeIndex === 4 ? 'DUSK' : 'NIGHT'}
          </button>
          <button 
            onClick={() => setWeather(weather === 'CLEAR' ? 'RAIN' : 'CLEAR')}
            className="flex-1 px-3 py-2 rounded-md text-[10px] tracking-[1.5px] uppercase font-semibold transition-all border border-[#7fffd4]/30 text-[#7fffd4] hover:bg-[#7fffd4]/10"
          >
            Weather: {weather}
          </button>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-[10px] mb-1 tracking-[2px] text-white/60 uppercase font-semibold">
            <span>Local Time</span>
            <span className="text-[#7fffd4] font-bold">{timeLabel}</span>
          </div>
          <div className="text-3xl font-black font-orbitron tracking-widest text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {currentTime.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className="h-0.5 w-full bg-white/10 mt-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#7fffd4] shadow-[0_0_10px_rgba(127,255,212,0.8)] transition-all duration-1000"
              style={{ width: `${timeOfDay}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <button 
            className="px-4 py-1.5 rounded-full text-[10px] tracking-[1.5px] uppercase font-semibold transition-all border border-[#7fffd4]/30 text-[#7fffd4]"
            style={{ background: drifting ? 'rgba(127,255,212,0.2)' : 'rgba(255,255,255,0.05)' }}
            onClick={() => setDrifting(!drifting)}
          >
            Drift
          </button>
          <span className="text-[10px] text-white/40 font-mono tracking-wider">
            <span className="text-white/70">{fps}</span> FPS
          </span>
        </div>
      </div>
    </div>
  );
};
