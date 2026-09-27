/**
 * OpticalThermalSim - Complete Optical, Thermal, Fiber Propagation, and Daylighting Model
 * 
 * Physical Models Implemented:
 *  1. Concentrator Optics (Fresnel / Parabolic) & Tracking Cosine Factor
 *  2. Thermal Balance & IR Cold-Mirror / Heat Rejection Filter Model
 *  3. Waveguide Coupling (Acceptance Cone, NA, Fresnel Reflection, Alignment)
 *  4. Fiber Core Transmission (Beer-Lambert / dB Attenuation + Macrobend Loss)
 *  5. Luminaire Diffuser & Zonal Cavity Lumen Indoor Photometric Model
 *  6. Hybrid LED Closed-Loop & Energy/Carbon Life-Cycle Metrics
 */

class OpticalThermalSim {
    constructor() {
        // Default physical parameters
        this.params = {
            // Collector
            collectorType: 'fresnel', // 'fresnel' | 'parabolic'
            collectorDiameter: 0.8,   // meters (aperture diameter)
            collectorEfficiency: 0.88,// baseline optical efficiency of lens
            focalLength: 0.65,        // meters
            trackerType: 'dual_axis', // 'fixed' | 'single_axis' | 'dual_axis' | 'ai_optimized'
            trackingAccuracy: 0.98,   // tracking alignment factor (0-1)

            // Thermal
            ambientTemp: 28.0,        // °C
            irFilterEnabled: true,    // Heat / IR rejection cold mirror filter
            irFilterRejection: 0.85,  // 85% of near-IR and thermal spectrum filtered
            focalMaxSafeTemp: 85.0,   // °C (overheat alarm threshold)

            // Fiber Waveguide
            fiberType: 'quartz_silica', // 'pmma' | 'quartz_silica' | 'quartz_bundle'
            fiberLength: 12.0,        // meters (1m to 50m)
            fiberCoreDiameter: 10.0,  // mm (large-core or bundle)
            numericalAperture: 0.48,  // NA = sin(acceptance_half_angle)
            attenuation_dB_per_m: 0.05, // dB/m (Quartz silica ~0.02-0.05, PMMA ~0.15-0.20)
            couplingEfficiency: 0.82, // optical alignment & AR coating coupling factor
            bendRadius: 0.25,         // meters
            bendLoss_dB: 0.02,        // macrobend loss

            // Diffuser & Indoor Room
            diffuserEfficiency: 0.89, // optical transmittance of luminaire diffuser
            roomLength: 6.0,          // meters
            roomWidth: 5.0,           // meters
            roomHeight: 3.0,          // meters
            workplaneHeight: 0.8,     // meters (desk height)
            ceilingReflectance: 0.70, // 70%
            wallReflectance: 0.50,    // 50%
            floorReflectance: 0.20,   // 20%
            targetLux: 500.0,         // target illuminance in Lux (300, 500, 750, or custom)
            occupancy: true,          // room occupied status

            // LED Backup System
            ledMaxPower: 60.0,        // Watts (at 100% full brightness)
            ledEfficacy: 110.0,       // Lumens per Watt
            ledDimmingLevel: 0.0,     // 0.0 (off) to 1.0 (100% full)
            gridEmissionFactor: 0.72  // kg CO2 per kWh (typical grid baseline)
        };
    }

    /**
     * Set one or multiple parameters
     */
    updateParams(newParams) {
        this.params = { ...this.params, ...newParams };
    }

    /**
     * Compute Collector Aperture Area (m²)
     */
    getCollectorArea() {
        const r = this.params.collectorDiameter / 2.0;
        return Math.PI * r * r;
    }

    /**
     * Calculate tracker orientation and cosine incidence angle
     * @param {Object} solarPos - { altitudeDeg, azimuthDeg, zenithDeg }
     */
    calculateTrackerGeometry(solarPos) {
        const { trackerType } = this.params;
        let trackerAlt = 0.0;
        let trackerAz = 180.0;
        let trackingErrorDeg = 0.0;
        let cosIncidence = 1.0;

        if (!solarPos.isSunUp) {
            return {
                trackerAlt: 0,
                trackerAz: 180,
                trackingErrorDeg: 0,
                cosIncidence: 0,
                trackingEfficiency: 0
            };
        }

        switch (trackerType) {
            case 'fixed':
                // Fixed collector facing South (180°) tilted at latitude approx (30°)
                trackerAlt = 30.0;
                trackerAz = 180.0;
                // Cosine of incidence angle theta_i
                // cos(theta_i) = sin(alt)*sin(beta) + cos(alt)*cos(beta)*cos(az - az_collector)
                const altR = SolarMath.deg2rad(solarPos.altitudeDeg);
                const azR = SolarMath.deg2rad(solarPos.azimuthDeg);
                const trkAltR = SolarMath.deg2rad(trackerAlt);
                const trkAzR = SolarMath.deg2rad(trackerAz);
                cosIncidence = Math.sin(altR) * Math.sin(trkAltR) + Math.cos(altR) * Math.cos(trkAltR) * Math.cos(azR - trkAzR);
                cosIncidence = Math.max(0.0, Math.min(1.0, cosIncidence));
                trackingErrorDeg = Math.round(SolarMath.rad2deg(Math.acos(cosIncidence)) * 10) / 10;
                break;

            case 'single_axis':
                // Single-axis tracker (North-South horizontal axis, tracks East-West Azimuth)
                trackerAz = solarPos.azimuthDeg;
                trackerAlt = 45.0; // fixed seasonal tilt
                const dAlt = Math.abs(solarPos.altitudeDeg - trackerAlt);
                cosIncidence = Math.cos(SolarMath.deg2rad(dAlt));
                cosIncidence = Math.max(0.0, Math.min(1.0, cosIncidence));
                trackingErrorDeg = Math.round(dAlt * 10) / 10;
                break;

            case 'dual_axis':
                // Continuous 2-axis tracking with standard stepper accuracy (0.5° - 1.2° jitter)
                trackingErrorDeg = (1.0 - this.params.trackingAccuracy) * 4.0; // typical 0.8° error
                trackerAlt = solarPos.altitudeDeg - (trackingErrorDeg * 0.5);
                trackerAz = solarPos.azimuthDeg + (trackingErrorDeg * 0.5);
                cosIncidence = Math.cos(SolarMath.deg2rad(trackingErrorDeg));
                break;

            case 'ai_optimized':
                // AI-predicted active closed-loop tracking with predictive angular smoothing (error <= 0.15°)
                trackingErrorDeg = 0.12;
                trackerAlt = solarPos.altitudeDeg;
                trackerAz = solarPos.azimuthDeg;
                cosIncidence = Math.cos(SolarMath.deg2rad(trackingErrorDeg));
                break;
        }

        const trackingEfficiency = Math.max(0.0, cosIncidence);

        return {
            trackerAlt: Math.max(0, Math.min(90, trackerAlt)),
            trackerAz: (trackerAz + 360) % 360,
            trackingErrorDeg: Math.round(trackingErrorDeg * 100) / 100,
            cosIncidence: cosIncidence,
            trackingEfficiency: trackingEfficiency
        };
    }

    /**
     * Compute Optical Power collected, concentrated, and thermal metrics
     */
    calculateOpticalAndThermal(solarPos, irradianceData, trackerGeo) {
        const area = this.getCollectorArea();
        const DNI = irradianceData.DNI; // W/m² (direct beam sunlight)
        const DHI = irradianceData.DHI; // W/m² (diffuse sky)

        // Incoming Direct Solar Power hitting collector aperture (Watts)
        // P_incident = (DNI * cosIncidence + 0.1 * DHI) * Area
        const P_incident = (DNI * trackerGeo.cosIncidence + 0.08 * DHI) * area;

        // Concentrator optical efficiency
        let opticalEff = this.params.collectorEfficiency;
        if (this.params.collectorType === 'parabolic') {
            opticalEff *= 0.94; // slightly higher specular reflection, but mirror dusting
        }

        // Geometric Concentration Ratio C_R = Area_collector / Area_focal_spot
        const focalSpotDiameter_mm = 12.0; // mm
        const focalSpotArea_m2 = Math.PI * Math.pow(focalSpotDiameter_mm / 2000.0, 2);
        const concentrationRatio = Math.round(area / focalSpotArea_m2);

        // Power focused at focal point (Watts)
        const P_focused = P_incident * opticalEff * trackerGeo.trackingEfficiency;

        // Thermal Modeling at Focal Point
        // IR filtration: Solar spectrum has ~47% visible, ~51% IR, ~2% UV
        const visibleFraction = 0.48;
        const irFraction = 0.52;

        let effectiveIR = irFraction;
        if (this.params.irFilterEnabled) {
            // Cold mirror / IR rejection filter reflects away IR spectrum before fiber ferrule
            effectiveIR *= (1.0 - this.params.irFilterRejection);
        }

        const thermalPowerAbsorbed = P_focused * (effectiveIR * 0.75 + visibleFraction * (1.0 - this.params.couplingEfficiency));

        // Heat dissipation equilibrium: Q_abs = h * A_ferrule * (T_focal - T_amb) + Radiation
        const h_convection = 32.0; // W/(m²·K) forced/natural air convection
        const heatTransferArea = 0.0045; // m² heatsink/ferrule area
        const deltaT = thermalPowerAbsorbed / (h_convection * heatTransferArea + 0.08);
        const focalTemp = Math.round((this.params.ambientTemp + deltaT) * 10) / 10;
        const collectorSurfaceTemp = Math.round((this.params.ambientTemp + (P_incident * (1 - opticalEff)) / (h_convection * area * 2.0)) * 10) / 10;

        const isOverheated = focalTemp > this.params.focalMaxSafeTemp;
        const thermalSafetyMargin = Math.max(0, Math.round((this.params.focalMaxSafeTemp - focalTemp) * 10) / 10);

        return {
            collectorArea: Math.round(area * 1000) / 1000,
            concentrationRatio: concentrationRatio,
            P_incident: Math.round(P_incident * 100) / 100,
            P_focused: Math.round(P_focused * 100) / 100,
            thermalPowerAbsorbed: Math.round(thermalPowerAbsorbed * 100) / 100,
            focalTemp: focalTemp,
            collectorSurfaceTemp: collectorSurfaceTemp,
            isOverheated: isOverheated,
            thermalSafetyMargin: thermalSafetyMargin
        };
    }

    /**
     * Optical Fiber Waveguide Transmission Model
     */
    calculateFiberTransmission(opticalData) {
        // Fiber Input Power (Visible spectrum coupled into core)
        // Visible spectrum power at focal point = P_focused * visibleFraction (0.48)
        const visibleOpticalPower = opticalData.P_focused * 0.48;

        // Coupling Losses:
        // 1. Fresnel Reflection at fiber entrance face: R = ((n - 1)/(n + 1))^2 ≈ 4% per uncoated face
        // 2. Numerical Aperture Acceptance Angle Theta_a = arcsin(NA)
        // 3. Alignment / Area mismatch factor
        const couplingEff = this.params.couplingEfficiency;
        const P_fiber_in = visibleOpticalPower * couplingEff;

        // Attenuation calculation (Beer-Lambert law in dB/m):
        // Total Loss (dB) = (alpha_dB_per_m * Length) + BendLoss_dB
        let alpha = this.params.attenuation_dB_per_m;
        if (this.params.fiberType === 'pmma') {
            alpha = 0.16; // PMMA plastic optical fiber higher loss
        } else if (this.params.fiberType === 'quartz_silica') {
            alpha = 0.035; // Quartz Silica high transmittance
        } else {
            alpha = 0.045; // Quartz multi-core bundle
        }

        const totalLoss_dB = (alpha * this.params.fiberLength) + this.params.bendLoss_dB;
        // Transmission Efficiency T = 10^(-totalLoss_dB / 10)
        const transmissionEfficiency = Math.pow(10, -totalLoss_dB / 10.0);

        // Power out of fiber at interior luminaire (Optical Watts)
        const P_fiber_out = P_fiber_in * transmissionEfficiency;

        // Luminous Flux generated (Lumens)
        // Daylight luminous efficacy for visible spectrum coupled light ≈ 210 - 240 lm/W (photopic eye sensitivity curve V(lambda))
        const visibleLuminousEfficacy = 220.0; // lm/W
        const daylightLuminousFlux = P_fiber_out * visibleLuminousEfficacy * this.params.diffuserEfficiency;

        return {
            P_fiber_in: Math.round(P_fiber_in * 100) / 100,
            P_fiber_out: Math.round(P_fiber_out * 100) / 100,
            totalLoss_dB: Math.round(totalLoss_dB * 100) / 100,
            transmissionEfficiency: Math.round(transmissionEfficiency * 1000) / 1000,
            daylightLuminousFlux: Math.round(daylightLuminousFlux * 10) / 10
        };
    }

    /**
     * Room Illuminance & Hybrid LED Calculation via Zonal Cavity Lumen Method
     */
    calculateIndoorLighting(fiberData) {
        const { roomLength, roomWidth, roomHeight, workplaneHeight, targetLux, occupancy } = this.params;
        const floorArea = roomLength * roomWidth;

        // Room Cavity Ratio (RCR):
        // RCR = 5 * H_rc * (Length + Width) / (Length * Width)
        const cavityHeight = roomHeight - workplaneHeight;
        const RCR = (5.0 * cavityHeight * (roomLength + roomWidth)) / floorArea;

        // Coefficient of Utilization (CU) based on RCR and reflectances (IESNA standard approximation)
        // CU typically ranges between 0.55 to 0.78
        const baseCU = 0.72;
        const CU = Math.max(0.35, baseCU - (RCR * 0.038) + (this.params.ceilingReflectance * 0.1) + (this.params.wallReflectance * 0.05));
        const LLF = 0.88; // Dirt depreciation + diffuser dust factor

        // Indoor Daylight Illuminance on Desk Workplane (Lux = Lumens / m² * CU * LLF)
        const daylightLux = (fiberData.daylightLuminousFlux * CU * LLF) / floorArea;

        // If room is unoccupied and energy saving mode is active, target lux drops to standby (e.g. 50 lux or 0)
        const activeTargetLux = occupancy ? targetLux : 50.0;

        // Lux Deficit
        const luxDeficit = Math.max(0.0, activeTargetLux - daylightLux);

        // Required LED Lumens to satisfy deficit
        // E_led = (Phi_led * CU * LLF) / floorArea => Phi_led = (E_deficit * floorArea) / (CU * LLF)
        const requiredLEDLumens = (luxDeficit * floorArea) / (CU * LLF);

        // Maximum LED Lumens achievable by LED fixture
        const maxLEDLumens = this.params.ledMaxPower * this.params.ledEfficacy;

        // LED Dimming fraction (0.0 to 1.0)
        let ledDimming = requiredLEDLumens / maxLEDLumens;
        ledDimming = Math.min(1.0, Math.max(0.0, ledDimming));

        // Actual LED Lumens and Electrical Power (Watts)
        const actualLEDLumens = ledDimming * maxLEDLumens;
        const ledElectricalPower = ledDimming * this.params.ledMaxPower;

        // Actual LED Illuminance contributed on desk
        const ledLux = (actualLEDLumens * CU * LLF) / floorArea;

        // Total Combined Indoor Illuminance (Lux)
        const totalIndoorLux = daylightLux + ledLux;

        // Uniformity Ratio (Min Lux / Avg Lux approximation across 9 grid points)
        // Diffuser + diffuse reflection provides high uniformity (0.75 - 0.90)
        const uniformityRatio = Math.min(0.92, 0.68 + (0.15 * (daylightLux > 0 ? 1 : 0)) + (0.1 * (ledLux > 0 ? 1 : 0)));

        // Energy and Sustainability Metrics
        // Baseline: Standard building with 100% LED lighting continuously on to meet target lux
        const baselineRequiredLumens = (activeTargetLux * floorArea) / (CU * LLF);
        const baselineLEDPower = Math.min(this.params.ledMaxPower, (baselineRequiredLumens / this.params.ledEfficacy));
        const powerSavedWatts = Math.max(0.0, baselineLEDPower - ledElectricalPower);
        const energySavingPercent = baselineLEDPower > 0 ? (powerSavedWatts / baselineLEDPower) * 100.0 : 100.0;

        // Hourly CO2 emissions avoided (g CO2 / hour)
        const co2AvoidedGramsPerHour = (powerSavedWatts / 1000.0) * this.params.gridEmissionFactor * 1000.0;

        return {
            floorArea: floorArea,
            RCR: Math.round(RCR * 100) / 100,
            CU: Math.round(CU * 100) / 100,
            daylightLux: Math.round(daylightLux * 10) / 10,
            ledLux: Math.round(ledLux * 10) / 10,
            totalIndoorLux: Math.round(totalIndoorLux * 10) / 10,
            targetLux: activeTargetLux,
            luxDeficit: Math.round(luxDeficit * 10) / 10,
            ledDimmingPercent: Math.round(ledDimming * 1000) / 10,
            ledElectricalPower: Math.round(ledElectricalPower * 10) / 10,
            baselineLEDPower: Math.round(baselineLEDPower * 10) / 10,
            powerSavedWatts: Math.round(powerSavedWatts * 10) / 10,
            energySavingPercent: Math.round(energySavingPercent * 10) / 10,
            co2AvoidedGramsPerHour: Math.round(co2AvoidedGramsPerHour * 10) / 10,
            uniformityRatio: Math.round(uniformityRatio * 100) / 100
        };
    }

    /**
     * Complete End-to-End Simulation Step
     */
    simulate(solarPos, weatherData) {
        const irradiance = SolarMath.calculateIrradiance(solarPos, weatherData.weather, weatherData.cloudFactor);
        const trackerGeo = this.calculateTrackerGeometry(solarPos);
        const opticalThermal = this.calculateOpticalAndThermal(solarPos, irradiance, trackerGeo);
        const fiber = this.calculateFiberTransmission(opticalThermal);
        const lighting = this.calculateIndoorLighting(fiber);

        // Overall System Optical Efficiency: P_fiber_out / P_incident
        const systemOpticalEfficiency = opticalThermal.P_incident > 0 
            ? (fiber.P_fiber_out / opticalThermal.P_incident) * 100.0 
            : 0.0;

        return {
            solarPos: solarPos,
            irradiance: irradiance,
            trackerGeo: trackerGeo,
            opticalThermal: opticalThermal,
            fiber: fiber,
            lighting: lighting,
            params: this.params,
            systemOpticalEfficiency: Math.round(systemOpticalEfficiency * 10) / 10
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpticalThermalSim;
}
