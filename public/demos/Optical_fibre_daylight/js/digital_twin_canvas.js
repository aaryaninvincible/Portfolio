/**
 * DigitalTwinCanvas - Real-Time Animated Hardware Simulation Engine
 * High-performance 2D Canvas & Vector Graphics Renderer
 * 
 * Features:
 *  - Dynamic Atmospheric Sky Gradient & Celestial Sun Motion
 *  - Moving Solar Rays & Ray-Concentration Focal Beam
 *  - Motorized 2-Axis Tracker Gimbal & Fresnel/Parabolic Optics
 *  - IR Rejection Cold-Mirror Filter & Thermal Hotspot Glow
 *  - Fiber Optic Lightwave Pulse Propagation Animation
 *  - Photometric Room Rendering with Desk, Occupant, Diffuser & LED Matrix
 *  - 9 Interactive Virtual Sensor HUD Pins with Live Telemetry
 */

class DigitalTwinCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Internal animation state
        this.animationTime = 0.0;
        this.cloudOffset = 0.0;
        this.photons = [];
        this.maxPhotons = 40;
        this.initPhotons();

        // Responsive sizing
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width || 1200;
        this.height = rect.height || 620;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.floor(this.width * dpr);
        this.canvas.height = Math.floor(this.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    initPhotons() {
        this.photons = [];
        for (let i = 0; i < this.maxPhotons; i++) {
            this.photons.push({
                progress: Math.random(), // 0.0 to 1.0 along fiber path
                speed: 0.008 + Math.random() * 0.006,
                size: 2.0 + Math.random() * 2.5
            });
        }
    }

    /**
     * Main Render Loop
     * @param {Object} state - Current full simulation state
     * @param {Object} aiState - Current AI controller outputs
     */
    render(state, aiState) {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        this.animationTime += 0.03;
        this.cloudOffset += 0.25;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        // Section Dividers / Layout Coordinates
        const skyX = 0;
        const skyY = 0;
        const skyW = w * 0.48;
        const skyH = h * 0.70;

        const roofY = h * 0.46;
        const roomX = w * 0.48;
        const roomY = 0;
        const roomW = w * 0.52;
        const roomH = h;

        // 1. Draw Outdoor Sky & Celestial Sun
        this.drawOutdoorSky(ctx, skyX, skyY, skyW, skyH, state);

        // 2. Draw Clouds & Weather FX
        this.drawWeatherEffects(ctx, skyX, skyY, skyW, skyH, state);

        // 3. Draw Building Exterior, Rooftop, & Collector Pedestal
        this.drawRooftopExterior(ctx, skyX, roofY, skyW, h - roofY, state);

        // 4. Draw Solar Collector & 2-Axis Tracker Gimbal
        const collectorHub = { x: skyW * 0.58, y: roofY - 25 };
        const sunPosScreen = this.getSunScreenPos(skyW, skyH, state.solarPos);
        this.drawSolarCollector(ctx, collectorHub, sunPosScreen, state, aiState);

        // 5. Draw Sun Rays & Focal Concentration Beam
        if (state.solarPos.isSunUp && state.irradiance.GHI > 5) {
            this.drawSunRaysAndFocalBeam(ctx, sunPosScreen, collectorHub, state);
        }

        // 6. Draw Optical Fiber Routing & Photon Propagation
        const diffuserPos = { x: roomX + roomW * 0.42, y: 75 };
        this.drawOpticalFiberPath(ctx, collectorHub, diffuserPos, state);

        // 7. Draw Indoor Architectural Room & Photometric Lighting Field
        this.drawIndoorRoom(ctx, roomX, roomY, roomW, roomH, diffuserPos, state, aiState);

        // 8. Draw 9 Sensor HUD Overlays
        this.drawSensorHUD(ctx, collectorHub, diffuserPos, roomX, roomW, roomH, state, aiState);
    }

    /**
     * Compute Sun Screen Coordinates
     */
    getSunScreenPos(skyW, skyH, solarPos) {
        if (!solarPos.isSunUp) {
            return { x: skyW * 0.2, y: skyH * 0.95 };
        }
        // Map Azimuth (90° to 270°) and Altitude (0° to 90°)
        const altNorm = Math.min(1.0, solarPos.altitudeDeg / 90.0);
        // Morning (East=90) to Evening (West=270)
        let azNorm = (solarPos.azimuthDeg - 90.0) / 180.0;
        azNorm = Math.max(0.08, Math.min(0.92, azNorm));

        const x = skyW * azNorm;
        const y = skyH * 0.88 - (altNorm * (skyH * 0.72));
        return { x, y };
    }

    /**
     * Draw Sky Background with Day/Night Dynamic Gradient
     */
    drawOutdoorSky(ctx, x, y, w, h, state) {
        const alt = state.solarPos.altitudeDeg;
        let skyGrad = ctx.createLinearGradient(x, y, x, y + h);

        if (!state.solarPos.isSunUp || alt <= 0) {
            // Night
            skyGrad.addColorStop(0, '#060a17');
            skyGrad.addColorStop(0.6, '#0f172a');
            skyGrad.addColorStop(1, '#1e293b');
        } else if (alt < 15) {
            // Dawn / Dusk
            skyGrad.addColorStop(0, '#1e1b4b');
            skyGrad.addColorStop(0.4, '#831843');
            skyGrad.addColorStop(0.8, '#ea580c');
            skyGrad.addColorStop(1, '#fbbf24');
        } else {
            // Daytime
            const cloudFactor = state.irradiance.clearnessIndex;
            if (state.irradiance.weatherLabel === 'overcast' || state.irradiance.weatherLabel === 'rainy') {
                skyGrad.addColorStop(0, '#334155');
                skyGrad.addColorStop(0.7, '#475569');
                skyGrad.addColorStop(1, '#64748b');
            } else {
                skyGrad.addColorStop(0, '#0369a1');
                skyGrad.addColorStop(0.5, '#38bdf8');
                skyGrad.addColorStop(1, '#bae6fd');
            }
        }

        ctx.fillStyle = skyGrad;
        ctx.fillRect(x, y, w, h);

        // Sun Corona and Core
        if (state.solarPos.isSunUp) {
            const sun = this.getSunScreenPos(w, h, state.solarPos);
            
            // Solar Glow Corona
            const coronaRadius = 45 + Math.sin(this.animationTime * 2) * 4;
            const sunGrad = ctx.createRadialGradient(sun.x, sun.y, 4, sun.x, sun.y, coronaRadius);
            sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            sunGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.9)');
            sunGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.4)');
            sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

            ctx.beginPath();
            ctx.arc(sun.x, sun.y, coronaRadius, 0, Math.PI * 2);
            ctx.fillStyle = sunGrad;
            ctx.fill();

            // Sun Core
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Solar Celestial Path (Dashed Arc)
            ctx.beginPath();
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.lineWidth = 1.5;
            ctx.ellipse(w * 0.5, h * 0.88, w * 0.42, h * 0.65, 0, Math.PI, 0);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    /**
     * Draw Clouds and Weather Animation
     */
    drawWeatherEffects(ctx, x, y, w, h, state) {
        const weather = state.irradiance.weatherLabel;
        if (weather === 'sunny') return;

        const numClouds = weather === 'partly_cloudy' ? 3 : 6;
        ctx.fillStyle = weather === 'rainy' ? 'rgba(71, 85, 105, 0.75)' : 'rgba(255, 255, 255, 0.65)';

        for (let i = 0; i < numClouds; i++) {
            const cx = ((this.cloudOffset * (0.8 + i * 0.3) + i * 140) % (w + 200)) - 100;
            const cy = y + 45 + (i * 35) % (h * 0.4);
            const scale = 0.7 + (i % 3) * 0.3;

            this.drawSingleCloud(ctx, cx, cy, scale);
        }

        // Rainy particles
        if (weather === 'rainy') {
            ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
            ctx.lineWidth = 1.2;
            for (let r = 0; r < 40; r++) {
                const rx = (r * 23 + this.animationTime * 150) % w;
                const ry = (r * 17 + this.animationTime * 350) % (h * 0.85);
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx - 6, ry + 16);
                ctx.stroke();
            }
        }
    }

    drawSingleCloud(ctx, cx, cy, scale) {
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 20 * scale, cy - 10 * scale, 28 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 48 * scale, cy - 8 * scale, 24 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 65 * scale, cy + 4 * scale, 18 * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw Building Roof, Parapet, and Tracker Pedestal
     */
    drawRooftopExterior(ctx, x, y, w, h, state) {
        // Rooftop slab
        const roofGrad = ctx.createLinearGradient(x, y, x, y + h);
        roofGrad.addColorStop(0, '#1e293b');
        roofGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = roofGrad;
        ctx.fillRect(x, y, w, h);

        // Concrete roof edge trim
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, w, 8);

        // Tracker Heavy Steel Mounting Pedestal
        const pedX = w * 0.58;
        const pedBaseY = y;
        
        ctx.fillStyle = '#475569';
        ctx.fillRect(pedX - 18, pedBaseY - 30, 36, 30); // vertical column
        ctx.fillStyle = '#64748b';
        ctx.fillRect(pedX - 28, pedBaseY - 4, 56, 6);   // baseplate bolted to slab

        // Dual-axis Azimuth Motor Gearbox
        ctx.beginPath();
        ctx.arc(pedX, pedBaseY - 30, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Draw Solar Collector (Fresnel / Parabolic) & Motorized Gimbal Tilt
     */
    drawSolarCollector(ctx, hub, sunPos, state, aiState) {
        ctx.save();
        ctx.translate(hub.x, hub.y);

        // Determine angle pointing towards sun
        let trackerAngleRad = 0;
        if (state.solarPos.isSunUp) {
            const dx = sunPos.x - hub.x;
            const dy = sunPos.y - hub.y;
            trackerAngleRad = Math.atan2(dy, dx) + Math.PI / 2;
        } else {
            trackerAngleRad = 0.3; // stowed resting angle
        }

        ctx.rotate(trackerAngleRad);

        const collectorType = state.opticalThermal.collectorType || 'fresnel';
        const dishRadius = 46;
        const focalDist = 48;

        // Concentrator Structural Frame
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-dishRadius - 4, 0);
        ctx.lineTo(dishRadius + 4, 0);
        ctx.stroke();

        if (collectorType === 'parabolic') {
            // Parabolic Dish Curvature
            ctx.beginPath();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.moveTo(-dishRadius, -8);
            ctx.quadraticCurveTo(0, 8, dishRadius, -8);
            ctx.stroke();
        } else {
            // Fresnel Lens Prisms
            const fresnelGrad = ctx.createLinearGradient(-dishRadius, 0, dishRadius, 0);
            fresnelGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
            fresnelGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
            fresnelGrad.addColorStop(1, 'rgba(56, 189, 248, 0.4)');

            ctx.fillStyle = fresnelGrad;
            ctx.fillRect(-dishRadius, -4, dishRadius * 2, 8);
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-dishRadius, -4, dishRadius * 2, 8);

            // Fresnel concentric prism teeth grooves
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            for (let g = -dishRadius + 6; g < dishRadius; g += 6) {
                ctx.beginPath();
                ctx.moveTo(g, -4);
                ctx.lineTo(g, 4);
                ctx.stroke();
            }
        }

        // Focal Struts supporting Optical Coupler Ferrule
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-dishRadius + 8, 0);
        ctx.lineTo(0, -focalDist);
        ctx.lineTo(dishRadius - 8, 0);
        ctx.stroke();

        // Optical Coupler / Cold Mirror Ferrule at Focal Point (0, -focalDist)
        ctx.fillStyle = state.opticalThermal.isOverheated ? '#ef4444' : '#10b981';
        ctx.beginPath();
        ctx.arc(0, -focalDist, 9, 0, Math.PI * 2);
        ctx.fill();

        // Focal Point Intense Light Spot
        if (state.solarPos.isSunUp && state.opticalThermal.P_focused > 1.0) {
            const focalGlow = ctx.createRadialGradient(0, -focalDist, 1, 0, -focalDist, 16);
            focalGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
            focalGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.9)');
            focalGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');

            ctx.beginPath();
            ctx.arc(0, -focalDist, 16, 0, Math.PI * 2);
            ctx.fillStyle = focalGlow;
            ctx.fill();
        }

        // Heat Rejection Filter (Cold Mirror) Diverted IR Ray (Dashed Red Beam)
        if (state.solarPos.isSunUp && state.opticalThermal.P_focused > 1.0) {
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -focalDist);
            ctx.lineTo(28, -focalDist - 20);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }

    /**
     * Draw Incident Solar Light Rays and Concentrated Focal Beam
     */
    drawSunRaysAndFocalBeam(ctx, sunPos, hub, state) {
        ctx.save();
        const numRays = 7;
        const dishRadius = 40;

        // Angle to sun
        const dx = sunPos.x - hub.x;
        const dy = sunPos.y - hub.y;
        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.lineWidth = 1.5;

        for (let i = 0; i < numRays; i++) {
            const offset = (i - (numRays - 1) / 2) * (dishRadius * 2 / (numRays - 1));
            const apertureX = hub.x + Math.cos(perpAngle) * offset;
            const apertureY = hub.y + Math.sin(perpAngle) * offset;

            // Incident ray from sun to aperture
            ctx.beginPath();
            ctx.moveTo(sunPos.x + Math.cos(perpAngle) * (offset * 0.4), sunPos.y + Math.sin(perpAngle) * (offset * 0.4));
            ctx.lineTo(apertureX, apertureY);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw Optical Fiber Cable Routing & Dynamic Photon Pulse Waveguide
     */
    drawOpticalFiberPath(ctx, collectorHub, diffuserPos, state) {
        ctx.save();

        // Path Control Points: Collector -> Conduit through Roof -> Ceiling Plenum -> Luminaire
        const p0 = { x: collectorHub.x, y: collectorHub.y - 40 };
        const p1 = { x: collectorHub.x + 35, y: collectorHub.y + 25 };
        const p2 = { x: collectorHub.x + 90, y: collectorHub.y + 40 };
        const p3 = { x: diffuserPos.x - 60, y: 55 };
        const p4 = { x: diffuserPos.x, y: diffuserPos.y - 12 };

        // Draw Outer Protective Sheath / Cladding (Black Flexible Conduit)
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw Inner Optical Core (Glowing Core)
        const coreIntensity = state.fiber.P_fiber_out > 0.1 
            ? Math.min(1.0, 0.2 + (state.fiber.P_fiber_out / 25.0) * 0.8) 
            : 0.1;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.strokeStyle = `rgba(56, 189, 248, ${coreIntensity * 0.7})`;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Animated Photons Travelling Through Fiber Waveguide
        if (state.fiber.P_fiber_out > 0.1) {
            this.photons.forEach(photon => {
                photon.progress += photon.speed;
                if (photon.progress > 1.0) photon.progress = 0.0;

                // Bezier interpolation
                const pt = this.getBezierPoint(photon.progress, p0, p1, p3, p4);

                // Attenuation factor: photons get slightly dimmer towards end
                const attenAlpha = (1.0 - photon.progress * 0.3) * coreIntensity;

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, photon.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(254, 240, 138, ${attenAlpha})`;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }

        ctx.restore();
    }

    /**
     * Compute point on cubic Bezier curve
     */
    getBezierPoint(t, p0, p1, p2, p3) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
        const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
        return { x, y };
    }

    /**
     * Draw Indoor Room, Diffuser Luminaire, Hybrid LED, Desk, and Occupant
     */
    drawIndoorRoom(ctx, rx, ry, rw, rh, diffuserPos, state, aiState) {
        ctx.save();

        // Room Background Walls & Ceiling
        const wallGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
        wallGrad.addColorStop(0, '#0f172a');
        wallGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(rx, ry, rw, rh);

        // Ceiling Line & Acoustic Tiles
        ctx.fillStyle = '#334155';
        ctx.fillRect(rx, ry, rw, 35);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        for (let tx = rx + 30; tx < rx + rw; tx += 60) {
            ctx.beginPath();
            ctx.moveTo(tx, ry);
            ctx.lineTo(tx, ry + 35);
            ctx.stroke();
        }

        // Room Wooden Parquet Floor
        const floorY = rh - 70;
        const floorGrad = ctx.createLinearGradient(rx, floorY, rx, rh);
        floorGrad.addColorStop(0, '#78350f');
        floorGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(rx, floorY, rw, 70);

        // Floor Baseboard
        ctx.fillStyle = '#92400e';
        ctx.fillRect(rx, floorY - 6, rw, 6);

        // 1. Calculate Photometric Dynamic Lighting Distribution Field
        const daylightLux = state.lighting.daylightLux;
        const ledLux = state.lighting.ledLux;
        const totalLux = state.lighting.totalIndoorLux;

        // Daylight Cone from Optical Diffuser
        if (daylightLux > 5) {
            const coneGrad = ctx.createRadialGradient(
                diffuserPos.x, diffuserPos.y, 10,
                diffuserPos.x, floorY - 30, rw * 0.55
            );
            const alphaDaylight = Math.min(0.65, (daylightLux / 750.0) * 0.65);
            coneGrad.addColorStop(0, `rgba(254, 243, 199, ${alphaDaylight})`);
            coneGrad.addColorStop(0.5, `rgba(254, 215, 170, ${alphaDaylight * 0.6})`);
            coneGrad.addColorStop(1, 'rgba(254, 215, 170, 0)');

            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.moveTo(diffuserPos.x - 30, diffuserPos.y);
            ctx.lineTo(rx + 20, floorY);
            ctx.lineTo(rx + rw - 20, floorY);
            ctx.lineTo(diffuserPos.x + 30, diffuserPos.y);
            ctx.closePath();
            ctx.fill();
        }

        // LED Supplemental Luminaire Glow
        if (ledLux > 5) {
            const ledGrad = ctx.createRadialGradient(
                diffuserPos.x, diffuserPos.y, 8,
                diffuserPos.x, floorY - 30, rw * 0.48
            );
            const alphaLED = Math.min(0.55, (ledLux / 600.0) * 0.55);
            ledGrad.addColorStop(0, `rgba(224, 242, 254, ${alphaLED})`);
            ledGrad.addColorStop(0.6, `rgba(186, 230, 253, ${alphaLED * 0.4})`);
            ledGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');

            ctx.fillStyle = ledGrad;
            ctx.beginPath();
            ctx.moveTo(diffuserPos.x - 35, diffuserPos.y);
            ctx.lineTo(rx + 40, floorY);
            ctx.lineTo(rx + rw - 40, floorY);
            ctx.lineTo(diffuserPos.x + 35, diffuserPos.y);
            ctx.closePath();
            ctx.fill();
        }

        // 2. Draw Luminaire Diffuser & Concentric LED Array Fixture
        this.drawLuminaireFixture(ctx, diffuserPos, state);

        // 3. Draw Workspace Desk, Chair, Computer, and Occupant
        this.drawWorkspaceDeskAndOccupant(ctx, rx + rw * 0.42, floorY, state);

        // 4. Desk Illuminance Lux Heatmap Bar
        this.drawDeskLuxSensorBar(ctx, rx + rw * 0.42, floorY - 95, state);

        ctx.restore();
    }

    /**
     * Draw Luminaire Fixture with Optical Diffuser Lens and LED Ring
     */
    drawLuminaireFixture(ctx, pos, state) {
        // Ceiling Mount Fixture Housing
        ctx.fillStyle = '#64748b';
        ctx.fillRect(pos.x - 42, pos.y - 14, 84, 14);

        // Optical Fiber Center Diffuser Dome
        const daylightActive = state.fiber.P_fiber_out > 0.1;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 22, 0, Math.PI);
        ctx.fillStyle = daylightActive ? '#fef08a' : '#cbd5e1';
        ctx.shadowColor = daylightActive ? '#facc15' : 'transparent';
        ctx.shadowBlur = daylightActive ? 18 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Micro-prism Diffuser Grid Pattern
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let dx = pos.x - 16; dx <= pos.x + 16; dx += 8) {
            ctx.beginPath();
            ctx.moveTo(dx, pos.y);
            ctx.lineTo(dx, pos.y + 16);
            ctx.stroke();
        }

        // Concentric Backup LED SMD Array Flanking Diffuser
        const ledLevel = state.lighting.ledDimmingPercent / 100.0;
        const ledColor = ledLevel > 0.05 ? `rgba(56, 189, 248, ${0.4 + ledLevel * 0.6})` : '#475569';

        [-32, -24, 24, 32].forEach(offset => {
            ctx.fillStyle = ledColor;
            ctx.beginPath();
            ctx.arc(pos.x + offset, pos.y - 2, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Draw Modern Desk, Chair, Computer, Books, and Seated Animated Occupant
     */
    drawWorkspaceDeskAndOccupant(ctx, deskCenterX, floorY, state) {
        const deskW = 190;
        const deskH = 75;
        const deskTopY = floorY - deskH;

        // Ergonomic Office Chair
        const chairX = deskCenterX - 35;
        ctx.fillStyle = '#334155';
        ctx.fillRect(chairX - 16, floorY - 55, 32, 8); // seat base
        ctx.fillRect(chairX - 3, floorY - 47, 6, 40);  // gas lift cylinder
        ctx.fillRect(chairX - 22, floorY - 8, 44, 8);  // 5-star wheeled base
        ctx.fillRect(chairX - 18, floorY - 110, 8, 55); // backrest

        // Occupant (Person working at desk)
        const isOccupied = (state && state.params && state.params.occupancy !== undefined) ? state.params.occupancy : true;
        if (isOccupied) {
            // Head
            ctx.fillStyle = '#fcd34d';
            ctx.beginPath();
            ctx.arc(chairX + 2, floorY - 120, 14, 0, Math.PI * 2);
            ctx.fill();

            // Torso (Navy shirt)
            ctx.fillStyle = '#1e40af';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(chairX - 10, floorY - 105, 26, 52, 6);
            else ctx.fillRect(chairX - 10, floorY - 105, 26, 52);
            ctx.fill();

            // Arms typing on keyboard
            ctx.strokeStyle = '#1e40af';
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(chairX + 6, floorY - 90);
            ctx.lineTo(chairX + 28, floorY - 80);
            ctx.stroke();
        }

        // Modern Minimalist Desk Top
        const deskGrad = ctx.createLinearGradient(deskCenterX - deskW / 2, deskTopY, deskCenterX + deskW / 2, deskTopY);
        deskGrad.addColorStop(0, '#475569');
        deskGrad.addColorStop(0.5, '#64748b');
        deskGrad.addColorStop(1, '#475569');
        ctx.fillStyle = deskGrad;
        ctx.beginPath();
        ctx.roundRect(deskCenterX - deskW / 2, deskTopY, deskW, 10, 3);
        ctx.fill();

        // Steel Desk Legs
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(deskCenterX - deskW / 2 + 10, deskTopY + 10, 8, deskH - 10);
        ctx.fillRect(deskCenterX + deskW / 2 - 18, deskTopY + 10, 8, deskH - 10);

        // Laptop on Desk
        const laptopX = deskCenterX + 5;
        const laptopY = deskTopY - 2;

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(laptopX - 16, laptopY - 2, 32, 4); // base
        
        // Laptop Screen (Glowing)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(laptopX - 14, laptopY - 2);
        ctx.lineTo(laptopX - 8, laptopY - 28);
        ctx.lineTo(laptopX + 18, laptopY - 28);
        ctx.lineTo(laptopX + 14, laptopY - 2);
        ctx.closePath();
        ctx.fill();

        // Desk Plant / Cup
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(deskCenterX + deskW / 2 - 30, deskTopY - 14, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#92400e';
        ctx.fillRect(deskCenterX + deskW / 2 - 34, deskTopY - 8, 8, 8);
    }

    /**
     * Draw Workplane Desk Lux Sensor Target Indicator
     */
    drawDeskLuxSensorBar(ctx, deskCenterX, sensorY, state) {
        const lux = state.lighting.totalIndoorLux;
        const target = state.lighting.targetLux;
        const ratio = Math.min(1.5, lux / (target || 500.0));

        // Sensor Photodiode Puck
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(deskCenterX + 55, sensorY + 15, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Lux Target Meter HUD
        const barW = 75;
        const barH = 7;
        const barX = deskCenterX + 20;
        const barY = sensorY + 26;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(barX, barY, barW, barH);

        // Fill progress
        ctx.fillStyle = lux >= target * 0.95 ? '#10b981' : '#f59e0b';
        ctx.fillRect(barX, barY, Math.min(barW, barW * (ratio / 1.2)), barH);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
    }

    /**
     * Draw 9 Interactive Virtual Sensor Badges with Pulsing HUD Lines
     */
    drawSensorHUD(ctx, collectorHub, diffuserPos, roomX, roomW, roomH, state, aiState) {
        ctx.save();
        const sensors = [
            {
                id: "S1",
                label: "Solar Irradiance",
                value: `${state.irradiance.GHI} W/m²`,
                sub: `DNI: ${state.irradiance.DNI} W/m²`,
                x: 18,
                y: 28,
                color: "#f59e0b"
            },
            {
                id: "S2",
                label: "Outdoor Lux",
                value: `${state.irradiance.outdoorLux.toLocaleString()} Lux`,
                sub: `Clearness: ${(state.irradiance.clearnessIndex * 100).toFixed(0)}%`,
                x: 18,
                y: 84,
                color: "#38bdf8"
            },
            {
                id: "S3",
                label: "2-Axis Tracker",
                value: `Alt: ${state.trackerGeo.trackerAlt.toFixed(1)}°`,
                sub: `Error: ${state.trackerGeo.trackingErrorDeg.toFixed(2)}°`,
                x: 18,
                y: 140,
                color: "#a855f7"
            },
            {
                id: "S4",
                label: "Focal Temp",
                value: `${state.opticalThermal.focalTemp}°C`,
                sub: state.opticalThermal.isOverheated ? "OVERHEAT!" : "Safe Margin",
                x: collectorHub.x - 75,
                y: collectorHub.y - 85,
                color: state.opticalThermal.isOverheated ? "#ef4444" : "#10b981"
            },
            {
                id: "S5",
                label: "Fiber Output",
                value: `${state.fiber.P_fiber_out.toFixed(1)} W Opt`,
                sub: `Loss: ${state.fiber.totalLoss_dB.toFixed(2)} dB`,
                x: diffuserPos.x - 145,
                y: 28,
                color: "#06b6d4"
            },
            {
                id: "S6",
                label: "Indoor Lux",
                value: `${Math.round(state.lighting.totalIndoorLux)} Lux`,
                sub: `Target: ${state.lighting.targetLux} Lux`,
                x: roomX + roomW - 140,
                y: 28,
                color: state.lighting.totalIndoorLux >= state.lighting.targetLux * 0.95 ? "#10b981" : "#f59e0b"
            },
            {
                id: "S7",
                label: "LED Dimmer",
                value: `${state.lighting.ledDimmingPercent.toFixed(0)}% (${state.lighting.ledElectricalPower.toFixed(1)}W)`,
                sub: `Saved: ${state.lighting.energySavingPercent.toFixed(0)}%`,
                x: roomX + roomW - 140,
                y: 84,
                color: "#ec4899"
            },
            {
                id: "S8",
                label: "Occupancy",
                value: (state.params && state.params.occupancy) ? "DETECTED" : "VACANT",
                sub: "PIR Micro-radar",
                x: roomX + roomW - 140,
                y: 140,
                color: (state.params && state.params.occupancy) ? "#10b981" : "#64748b"
            },
            {
                id: "S9",
                label: "AI Controller",
                value: aiState.mode.toUpperCase(),
                sub: aiState.thermalSafetyActive ? "DEFOCUS GUARD" : "MPC Optimal",
                x: roomX + roomW - 140,
                y: 196,
                color: aiState.thermalSafetyActive ? "#ef4444" : "#3b82f6"
            }
        ];

        sensors.forEach(s => {
            this.drawSensorBadge(ctx, s.x, s.y, s.label, s.value, s.sub, s.color);
        });

        ctx.restore();
    }

    drawSensorBadge(ctx, x, y, label, val, sub, color) {
        const badgeW = 125;
        const badgeH = 46;

        // Background Glass Panel
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(x, y, badgeW, badgeH, 6);
        ctx.fill();

        // Border Accent
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Indicator Light Dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 10, y + 14, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = '600 9px "Inter", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(label.toUpperCase(), x + 18, y + 15);

        // Value
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(val, x + 10, y + 30);

        // Subtitle
        ctx.font = '500 8.5px "Inter", sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(sub, x + 10, y + 40);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DigitalTwinCanvas;
}
