import React, { useEffect, useRef, useState } from 'react';

declare const THREE: any;

export const SeaFooter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(60);
  const [seaState, setSeaState] = useState(29);
  const [drifting, setDrifting] = useState(false);
  const [timeLabel, setTimeLabel] = useState('GOLDEN HOUR');
  const [timeOfDay, setTimeOfDay] = useState(75);

  useEffect(() => {
    if (!containerRef.current || typeof THREE === 'undefined') return;

    const seaContainer = containerRef.current;
    let seaScene: any, seaCamera: any, seaRenderer: any;
    let water: any, sun: any, sky: any;
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

      // We read state from a ref or just closure? In React, state in closure can be stale.
      // But we can update uniforms via a separate useEffect on state change.
      // For now, time increment
      seaTime += 0.01 * (window as any)._seaSpeed;
      
      if (water) {
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0 * (window as any)._seaSpeed;
      }

      if ((window as any)._isDrifting) {
        seaCamera.position.y = 30 + Math.sin(seaTime * 2) * 2;
      } else {
        seaCamera.position.y = 30; // reset
      }

      seaRenderer.render(seaScene, seaCamera);
    }

    // Set initial real time
    const hour = new Date().getHours();
    let initialTimeVal = 75; // Default golden hour
    if (hour >= 6 && hour < 9) initialTimeVal = 30; // Morning
    else if (hour >= 9 && hour < 16) initialTimeVal = 55; // Midday
    else if (hour >= 16 && hour < 19) initialTimeVal = 75; // Golden hour
    else if (hour >= 19 && hour < 21) initialTimeVal = 90; // Dusk
    else initialTimeVal = 10; // Night
    setTimeOfDay(initialTimeVal);

    initSea();

    // expose instances to the component for state effects
    (window as any)._seaInstances = { seaRenderer, sky, water, sun };
    (window as any)._seaSpeed = 0.2 + (29 / 100) * 1.5;
    (window as any)._isDrifting = false;

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
      inst.seaRenderer.toneMappingExposure = 0.1;
    } else if (val < 45) {
      elevation = 5 + (val-20); label = "MORNING";
      inst.seaRenderer.toneMappingExposure = 0.3;
    } else if (val < 65) {
      elevation = 45; label = "MIDDAY";
      inst.seaRenderer.toneMappingExposure = 0.5;
    } else if (val < 85) {
      elevation = Math.max(0.5, 10 - (val-65)*0.5); label = "GOLDEN HOUR";
      inst.seaRenderer.toneMappingExposure = 0.4;
    } else {
      elevation = -1; label = "DUSK";
      inst.seaRenderer.toneMappingExposure = 0.2;
    }
    
    setTimeLabel(label);

    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(180);

    inst.sun.setFromSphericalCoords(1, phi, theta);

    inst.sky.material.uniforms[ 'sunPosition' ].value.copy(inst.sun);
    inst.water.material.uniforms[ 'sunDirection' ].value.copy(inst.sun).normalize();
  }, [timeOfDay]);

  // Update Water state
  useEffect(() => {
    const inst = (window as any)._seaInstances;
    if (!inst) return;
    inst.water.material.uniforms[ 'distortionScale' ].value = 1 + (seaState / 100) * 9;
    (window as any)._seaSpeed = 0.2 + (seaState / 100) * 1.5;
  }, [seaState]);

  // Update Drifting
  useEffect(() => {
    (window as any)._isDrifting = drifting;
  }, [drifting]);


  return (
    <div className="relative w-full h-[35vh] z-[9] overflow-hidden pointer-events-none font-sans">
      <style>{`
        .sea-ui {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 280px;
          background: rgba(30, 25, 30, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          color: rgba(255,255,255,0.9);
          pointer-events: auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          transform: scale(0.9);
          transform-origin: top left;
        }
        @media (min-width: 640px) {
          .sea-ui {
            width: 320px;
            padding: 28px;
            transform: scale(1);
          }
        }
        input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
        }
        input[type=range]:focus { outline: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #7fffd4;
          cursor: pointer;
          margin-top: -6px;
          box-shadow: 0 0 12px rgba(127,255,212,0.6);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 2px;
          cursor: pointer;
          background: rgba(255,255,255,0.15);
          border-radius: 1px;
        }
      `}</style>
      
      <div ref={containerRef} className="absolute top-0 left-0 w-full h-full pointer-events-auto" />
      
      <div className="sea-ui">
        <div className="text-[9px] tracking-[3px] text-white/50 mb-1.5 uppercase font-semibold">Realtime Ocean</div>
        <div className="text-2xl font-bold tracking-[2px] mb-1.5">OPEN SEA</div>
        <div className="text-[11px] text-white/40 mb-6 font-mono tracking-wide">Gerstner swell · FBM micro-surface</div>
        
        <div className="mb-5">
          <div className="flex justify-between text-[10px] mb-3 tracking-[2px] text-white/60 uppercase font-semibold">
            <span>Sea State</span>
            <span className="text-[#7fffd4] font-bold">{seaState}</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={seaState} 
            onChange={e => setSeaState(Number(e.target.value))}
          />
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-[10px] mb-3 tracking-[2px] text-white/60 uppercase font-semibold">
            <span>Time of Day</span>
            <span className="text-[#7fffd4] font-bold">{timeLabel}</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={timeOfDay} 
            onChange={e => setTimeOfDay(Number(e.target.value))}
          />
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
