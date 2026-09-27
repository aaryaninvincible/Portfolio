/**
 * SolarFiber AI - Central Application Controller
 * Coordinates physics simulation, digital twin canvas rendering, AI predictive controller,
 * real-time telemetry streaming, interactive event handlers, and research analytics.
 */

class SolarFiberApp {
    constructor() {
        // Core Physics & Model Engines
        this.simEngine = new OpticalThermalSim();
        this.aiController = new AIController();
        
        // Simulation Temporal State
        this.isPlaying = true;
        this.simSpeed = 5.0; // 1 second real time = 5 minutes sim time at 5x
        this.timeHours = 11.5; // Starts at 11:30 AM
        this.currentDate = new Date(2026, 5, 21); // June 21 Solstice
        this.latitude = 28.61;   // New Delhi default
        this.longitude = 77.20;
        this.weather = "sunny";
        this.cloudFactor = 0.0;

        // UI Element References
        this.initDOMReferences();

        // Subsystems
        this.canvas = new DigitalTwinCanvas('digital-twin-canvas');
        this.charts = new TelemetryCharts('telemetry-chart-container');
        this.experiments = new ExperimentsSuite(this);
        this.dataExporter = new DataExporter(this);

        // Bind UI Listeners
        this.bindEvents();

        // Start 60fps Loop
        this.lastFrameTime = performance.now();
        this.telemetryTickCounter = 0;
        requestAnimationFrame((t) => this.animationLoop(t));

        // Initial update
        this.updateSimulation();
    }

    initDOMReferences() {
        this.timeSlider = document.getElementById('time-slider');
        this.timeDisplay = document.getElementById('time-readout');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.speedSelect = document.getElementById('speed-select');
        this.weatherSelect = document.getElementById('weather-select');
        this.cloudSlider = document.getElementById('cloud-slider');
        this.cloudValueBadge = document.getElementById('cloud-val-badge');
        this.geoPresetSelect = document.getElementById('geo-preset-select');
        
        // Mode buttons
        this.modeButtons = document.querySelectorAll('.mode-btn');

        // Parameter Sliders
        this.collectorDiaSlider = document.getElementById('param-collector-dia');
        this.fiberLengthSlider = document.getElementById('param-fiber-length');
        this.targetLuxSelect = document.getElementById('param-target-lux');
        this.trackerTypeSelect = document.getElementById('param-tracker-type');
        this.fiberTypeSelect = document.getElementById('param-fiber-type');
        this.occupancyToggle = document.getElementById('param-occupancy-toggle');
        this.irFilterToggle = document.getElementById('param-ir-filter-toggle');
    }

    bindEvents() {
        // Play / Pause
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => {
                this.isPlaying = !this.isPlaying;
                this.playPauseBtn.innerHTML = this.isPlaying ? "⏸ Pause" : "▶ Play";
            });
        }

        // Reset
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.timeHours = 9.0;
                this.timeSlider.value = 9.0;
                this.weather = "sunny";
                this.weatherSelect.value = "sunny";
                this.cloudFactor = 0.0;
                this.cloudSlider.value = 0.0;
                this.charts.clear();
                this.updateSimulation();
            });
        }

        // Simulation Speed
        if (this.speedSelect) {
            this.speedSelect.addEventListener('change', (e) => {
                this.simSpeed = parseFloat(e.target.value);
            });
        }

        // Time Slider
        if (this.timeSlider) {
            this.timeSlider.addEventListener('input', (e) => {
                this.timeHours = parseFloat(e.target.value);
                this.updateSimulation();
            });
        }

        // Weather
        if (this.weatherSelect) {
            this.weatherSelect.addEventListener('change', (e) => {
                this.weather = e.target.value;
                if (this.weather === 'sunny') this.cloudFactor = 0.0;
                else if (this.weather === 'partly_cloudy') this.cloudFactor = 0.35;
                else if (this.weather === 'cloudy') this.cloudFactor = 0.75;
                else if (this.weather === 'overcast') this.cloudFactor = 0.90;
                else if (this.weather === 'rainy') this.cloudFactor = 1.0;
                this.cloudSlider.value = this.cloudFactor;
                if (this.cloudValueBadge) this.cloudValueBadge.textContent = `${Math.round(this.cloudFactor * 100)}%`;
                this.updateSimulation();
            });
        }

        // Cloud Slider
        if (this.cloudSlider) {
            this.cloudSlider.addEventListener('input', (e) => {
                this.cloudFactor = parseFloat(e.target.value);
                if (this.cloudValueBadge) this.cloudValueBadge.textContent = `${Math.round(this.cloudFactor * 100)}%`;
                this.updateSimulation();
            });
        }

        // Geolocation Presets
        if (this.geoPresetSelect) {
            this.geoPresetSelect.addEventListener('change', (e) => {
                const presets = {
                    delhi: { lat: 28.61, lon: 77.20 },
                    singapore: { lat: 1.35, lon: 103.82 },
                    london: { lat: 51.50, lon: -0.12 },
                    phoenix: { lat: 33.44, lon: -112.07 },
                    cairo: { lat: 30.04, lon: 31.23 },
                    tokyo: { lat: 35.67, lon: 139.65 }
                };
                const sel = presets[e.target.value];
                if (sel) {
                    this.latitude = sel.lat;
                    this.longitude = sel.lon;
                    this.simEngine.updateParams({ latitude: sel.lat, longitude: sel.lon });
                    this.updateSimulation();
                }
            });
        }

        // Mode Switcher Buttons
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.dataset.mode;
                this.aiController.setMode(mode);
                this.updateSimulation();
            });
        });

        // Parameters
        if (this.collectorDiaSlider) {
            this.collectorDiaSlider.addEventListener('input', (e) => {
                const dia = parseFloat(e.target.value);
                document.getElementById('collector-dia-badge').textContent = `${dia} m`;
                this.simEngine.updateParams({ collectorDiameter: dia });
                this.updateSimulation();
            });
        }

        if (this.fiberLengthSlider) {
            this.fiberLengthSlider.addEventListener('input', (e) => {
                const len = parseFloat(e.target.value);
                document.getElementById('fiber-length-badge').textContent = `${len} m`;
                this.simEngine.updateParams({ fiberLength: len });
                this.updateSimulation();
            });
        }

        if (this.targetLuxSelect) {
            this.targetLuxSelect.addEventListener('change', (e) => {
                this.simEngine.updateParams({ targetLux: parseFloat(e.target.value) });
                this.updateSimulation();
            });
        }

        if (this.trackerTypeSelect) {
            this.trackerTypeSelect.addEventListener('change', (e) => {
                this.simEngine.updateParams({ trackerType: e.target.value });
                this.updateSimulation();
            });
        }

        if (this.fiberTypeSelect) {
            this.fiberTypeSelect.addEventListener('change', (e) => {
                this.simEngine.updateParams({ fiberType: e.target.value });
                this.updateSimulation();
            });
        }

        if (this.occupancyToggle) {
            this.occupancyToggle.addEventListener('change', (e) => {
                this.simEngine.updateParams({ occupancy: e.target.checked });
                this.updateSimulation();
            });
        }

        if (this.irFilterToggle) {
            this.irFilterToggle.addEventListener('change', (e) => {
                this.simEngine.updateParams({ irFilterEnabled: e.target.checked });
                this.updateSimulation();
            });
        }

        // Chart Tab Switcher
        document.querySelectorAll('.chart-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.charts.setTab(btn.dataset.tab);
            });
        });

        // Demo Scenario Runner
        const demoBtn = document.getElementById('demo-scenario-btn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.experiments.start24HourDemo();
            });
        }

        // Experiment Buttons
        document.querySelectorAll('.exp-trigger-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.experiments.runExperiment(btn.dataset.exp);
            });
        });

        // Research Mode Modal
        const researchBtn = document.getElementById('research-mode-btn');
        const researchModal = document.getElementById('research-modal');
        if (researchBtn && researchModal) {
            researchBtn.addEventListener('click', () => {
                this.updateResearchModalContent();
                researchModal.classList.add('active');
            });
        }

        // Modal Close Buttons
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
            });
        });

        // CSV Export
        const exportCsvBtn = document.getElementById('export-csv-btn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                this.dataExporter.generateSynthetic24hDataset();
            });
        }

        // CSV Import
        const importCsvInput = document.getElementById('import-csv-input');
        if (importCsvInput) {
            importCsvInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        this.dataExporter.parseImportedCSV(evt.target.result);
                    };
                    reader.readAsText(file);
                }
            });
        }
    }

    /**
     * Simulation Step & State Update
     */
    updateSimulation() {
        // 1. Calculate Solar Astronomical Coordinates
        const solarPos = SolarMath.calculateSolarPosition(this.currentDate, this.timeHours, this.latitude, this.longitude);

        // 2. Execute End-to-End Physics Simulation
        const simState = this.simEngine.simulate(solarPos, { weather: this.weather, cloudFactor: this.cloudFactor });

        // 3. AI Predictive Controller Step
        this.aiController.recordTelemetry({ ...simState, cloudFactor: this.cloudFactor });
        const forecasts = this.aiController.predictFutureConditions(solarPos, { weather: this.weather, cloudFactor: this.cloudFactor }, this.simEngine);
        const aiOutputs = this.aiController.computeControl(simState, forecasts);

        // 4. Update Time UI
        const hh = Math.floor(this.timeHours).toString().padStart(2, '0');
        const mm = Math.floor((this.timeHours % 1) * 60).toString().padStart(2, '0');
        if (this.timeDisplay) this.timeDisplay.textContent = `${hh}:${mm}`;

        // 5. Update Telemetry Metric Readouts in Sidebar
        this.updateSidebarReadouts(simState, aiOutputs, forecasts);

        // 6. Push to Real-Time Charts
        this.latestSimState = simState;
        this.latestAIState = aiOutputs;
    }

    updateSidebarReadouts(sim, ai, forecasts) {
        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setTxt('telemetry-ghi', `${sim.irradiance.GHI} W/m²`);
        setTxt('telemetry-dni', `${sim.irradiance.DNI} W/m²`);
        setTxt('telemetry-outdoor-lux', `${sim.irradiance.outdoorLux.toLocaleString()} Lux`);
        setTxt('telemetry-solar-alt', `${sim.solarPos.altitudeDeg.toFixed(1)}° (${sim.solarPos.azimuthDeg.toFixed(1)}° Az)`);
        setTxt('telemetry-focal-temp', `${sim.opticalThermal.focalTemp}°C`);
        setTxt('telemetry-fiber-opt-power', `${sim.fiber.P_fiber_out.toFixed(1)} W Opt`);
        setTxt('telemetry-daylight-lux', `${Math.round(sim.lighting.daylightLux)} Lux`);
        setTxt('telemetry-total-indoor-lux', `${Math.round(sim.lighting.totalIndoorLux)} Lux`);
        setTxt('telemetry-led-power', `${sim.lighting.ledElectricalPower.toFixed(1)} W (${sim.lighting.ledDimmingPercent.toFixed(0)}%)`);
        setTxt('telemetry-energy-saved', `${sim.lighting.energySavingPercent.toFixed(0)}%`);
        setTxt('telemetry-co2-saved', `${sim.lighting.co2AvoidedGramsPerHour.toFixed(0)} g/hr`);

        // AI Forecast Rows
        if (forecasts && forecasts.length >= 3) {
            setTxt('ai-pred-15m-lux', `${Math.round(forecasts[0].projectedDaylightLux)} Lux`);
            setTxt('ai-pred-15m-led', `${forecasts[0].estimatedLEDNeeded.toFixed(1)} W`);

            setTxt('ai-pred-30m-lux', `${Math.round(forecasts[1].projectedDaylightLux)} Lux`);
            setTxt('ai-pred-30m-led', `${forecasts[1].estimatedLEDNeeded.toFixed(1)} W`);

            setTxt('ai-pred-60m-lux', `${Math.round(forecasts[2].projectedDaylightLux)} Lux`);
            setTxt('ai-pred-60m-led', `${forecasts[2].estimatedLEDNeeded.toFixed(1)} W`);
        }

        // Anomaly Status
        const anomalyBadge = document.getElementById('ai-anomaly-status');
        if (anomalyBadge) {
            anomalyBadge.textContent = ai.anomaly.message;
            anomalyBadge.className = `badge badge-${ai.anomaly.severity === 'danger' ? 'rose' : (ai.anomaly.severity === 'warning' ? 'amber' : 'green')}`;
        }
    }

    /**
     * Research Mode Modal Equation Breakdown
     */
    updateResearchModalContent() {
        const content = document.getElementById('research-modal-content');
        if (!content || !this.latestSimState) return;

        const sim = this.latestSimState;
        content.innerHTML = `
            <div class="research-header">
                <h2>Mathematical Model & Analytical Verification</h2>
                <p class="text-muted">Rigorous optical, thermodynamic, and photometric formulation with live variable inspection.</p>
            </div>

            <div class="eq-card">
                <div class="eq-title">1. Astronomical Solar Geometry & Extraterrestrial Irradiance</div>
                <div class="eq-formula">\\delta = 23.45^\\circ \\sin\\left(\\frac{360}{365}(284 + d)\\right), \\quad \\cos(\\theta_z) = \\sin(\\phi)\\sin(\\delta) + \\cos(\\phi)\\cos(\\delta)\\cos(\\omega)</div>
                <p class="eq-desc">Calculated Solar Altitude: <strong>${sim.solarPos.altitudeDeg.toFixed(2)}°</strong>, Solar Azimuth: <strong>${sim.solarPos.azimuthDeg.toFixed(2)}°</strong>, Air Mass: <strong>${sim.solarPos.airMass.toFixed(2)}</strong>.</p>
            </div>

            <div class="eq-card">
                <div class="eq-title">2. Solar Concentrator Optical Flux & Geometric Concentration Ratio</div>
                <div class="eq-formula">C_R = \\frac{A_{aperture}}{A_{focal}} = \\frac{\\pi (D/2)^2}{\\pi (d_{focal}/2)^2}, \\quad P_{focused} = [DNI \\cdot \\cos(\\theta_i) + c_{diff} DHI] \\cdot A_{col} \\cdot \\eta_{opt}</div>
                <p class="eq-desc">Aperture Area: <strong>${sim.opticalThermal.collectorArea} m²</strong>, Geometric Concentration: <strong>${sim.opticalThermal.concentrationRatio}x</strong>, Concentrated Power: <strong>${sim.opticalThermal.P_focused} W</strong>.</p>
            </div>

            <div class="eq-card">
                <div class="eq-title">3. Optical Waveguide Coupling & Beer-Lambert Attenuation Model</div>
                <div class="eq-formula">P_{out} = P_{in} \\cdot \\eta_{coupling} \\cdot 10^{-\\frac{\\alpha_{dB} \\cdot L + \\alpha_{bend}}{10}}, \\quad \\Phi_{daylight} = P_{out} \\cdot K_{vis} \\cdot \\eta_{diffuser}</div>
                <p class="eq-desc">Fiber Length: <strong>${this.simEngine.params.fiberLength} m</strong>, Waveguide Loss: <strong>${sim.fiber.totalLoss_dB} dB</strong>, Optical Transmittance: <strong>${(sim.fiber.transmissionEfficiency * 100).toFixed(1)}%</strong>, Output Luminous Flux: <strong>${sim.fiber.daylightLuminousFlux} lm</strong>.</p>
            </div>

            <div class="eq-card">
                <div class="eq-title">4. Zonal Cavity Lumen Indoor Photometric Model</div>
                <div class="eq-formula">E_{indoor} = \\frac{\\Phi_{total} \\cdot CU \\cdot LLF}{A_{floor}}, \\quad RCR = \\frac{5 H_{rc}(L + W)}{L \\cdot W}</div>
                <p class="eq-desc">Room Cavity Ratio (RCR): <strong>${sim.lighting.RCR}</strong>, Coefficient of Utilization (CU): <strong>${sim.lighting.CU}</strong>, Delivered Daylight Illuminance: <strong>${sim.lighting.daylightLux} Lux</strong>, Required Target: <strong>${sim.lighting.targetLux} Lux</strong>.</p>
            </div>

            <div class="eq-card">
                <div class="eq-title">5. Hybrid Electrical Supplementation & Carbon Life-Cycle Benefit</div>
                <div class="eq-formula">P_{LED} = \\max\\left(0, \\frac{E_{target} - E_{daylight}}{E_{target}}\\right) \\cdot P_{max}, \\quad CO_{2,avoided} = (P_{baseline} - P_{LED}) \\cdot EF_{grid}</div>
                <p class="eq-desc">Instantaneous LED Power: <strong>${sim.lighting.ledElectricalPower} W</strong> (vs Baseline ${sim.lighting.baselineLEDPower} W), Grid Power Reduction: <strong>${sim.lighting.energySavingPercent}%</strong>, CO2 Avoidance: <strong>${sim.lighting.co2AvoidedGramsPerHour} g CO2/hr</strong>.</p>
            </div>
        `;
    }

    /**
     * 60fps Main Animation & Simulation Loop
     */
    animationLoop(timestamp) {
        const dt = (timestamp - this.lastFrameTime) / 1000.0;
        this.lastFrameTime = timestamp;

        if (this.isPlaying) {
            // Advance simulation time (e.g. 5x speed = 5 minutes sim time per second)
            this.timeHours += (dt * this.simSpeed) / 60.0;
            if (this.timeHours >= 24.0) this.timeHours = 0.0;
            
            if (this.timeSlider) this.timeSlider.value = this.timeHours;
            this.updateSimulation();
        }

        // Render Canvas Visual Digital Twin
        if (this.latestSimState && this.latestAIState) {
            this.canvas.render(this.latestSimState, this.latestAIState);
        }

        // Telemetry Chart Feed (Push data every 20 frames)
        this.telemetryTickCounter++;
        if (this.telemetryTickCounter % 15 === 0 && this.latestSimState) {
            const hh = Math.floor(this.timeHours).toString().padStart(2, '0');
            const mm = Math.floor((this.timeHours % 1) * 60).toString().padStart(2, '0');
            this.charts.pushData(`${hh}:${mm}`, this.latestSimState);
        }

        requestAnimationFrame((t) => this.animationLoop(t));
    }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new SolarFiberApp();
});
