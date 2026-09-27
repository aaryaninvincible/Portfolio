/**
 * SolarMath - Astronomical Solar Position & Irradiance Calculation Engine
 * Implements standard solar geometry (Spencer, Michalsky, PSA algorithm)
 * and Perez / Haurwitz / Erbs clear sky & atmospheric models.
 * 
 * Units:
 *  - Angles: Degrees (internally converted to Radians for trigonometry)
 *  - Irradiance: W/m² (GHI, DNI, DHI)
 *  - Illuminance: Lux (lm/m²)
 *  - Solar constant G_sc = 1367 W/m²
 *  - Luminous efficacy of daylight: ~93-110 lm/W
 */

class SolarMath {
    static G_SC = 1367.0; // Solar constant in W/m²
    static LUMINOUS_EFFICACY_DIRECT = 105.0;  // lm/W for direct beam solar radiation
    static LUMINOUS_EFFICACY_DIFFUSE = 115.0; // lm/W for diffuse sky radiation

    /**
     * Calculate Day of Year (1 - 365/366)
     */
    static getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    /**
     * Converts degrees to radians
     */
    static deg2rad(deg) {
        return deg * (Math.PI / 180.0);
    }

    /**
     * Converts radians to degrees
     */
    static rad2deg(rad) {
        return rad * (180.0 / Math.PI);
    }

    /**
     * Computes solar position: Altitude, Azimuth, Zenith, Solar Time, Declination, Hour Angle
     * @param {Date} date - Local date object
     * @param {number} timeHours - Decimal hours (e.g. 13.5 for 1:30 PM)
     * @param {number} lat - Latitude in degrees (-90 to +90)
     * @param {number} lon - Longitude in degrees (-180 to +180)
     * @param {number} timezoneOffsetHours - UTC offset in hours (e.g. +5.5 for IST)
     */
    static calculateSolarPosition(date, timeHours, lat, lon, timezoneOffsetHours = 5.5) {
        const d = this.getDayOfYear(date);
        const latRad = this.deg2rad(lat);

        // Fractional year gamma (radians)
        const gamma = (2 * Math.PI / 365.0) * (d - 1 + (timeHours - 12.0) / 24.0);

        // Equation of Time (EoT) in minutes (Spencer 1971 formula)
        const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) 
                    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

        // Solar Declination delta (radians) (Spencer formula)
        const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
                    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
                    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

        // Local Solar Time (LST) in minutes
        // Standard Meridian = timezoneOffsetHours * 15°
        const lstMinutes = timeHours * 60.0 + eot + 4.0 * (lon - timezoneOffsetHours * 15.0);
        const solarTimeHours = (lstMinutes / 60.0 + 24.0) % 24.0;

        // Hour Angle omega (degrees & radians)
        // 12:00 solar time = 0°, morning negative, afternoon positive
        const omegaDeg = (solarTimeHours - 12.0) * 15.0;
        const omegaRad = this.deg2rad(omegaDeg);

        // Solar Zenith Angle theta_z (radians)
        // cos(theta_z) = sin(lat)*sin(decl) + cos(lat)*cos(decl)*cos(omega)
        let cosZenith = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(omegaRad);
        cosZenith = Math.max(-1.0, Math.min(1.0, cosZenith));
        const zenithRad = Math.acos(cosZenith);
        const zenithDeg = this.rad2deg(zenithRad);

        // Solar Altitude / Elevation angle alpha_s
        const altitudeDeg = 90.0 - zenithDeg;
        const altitudeRad = this.deg2rad(altitudeDeg);

        // Solar Azimuth Angle phi_s (degrees, measured from North = 0° clockwise, East=90°, South=180°, West=270°)
        let azimuthDeg = 180.0;
        if (altitudeDeg > -5.0) {
            const cosAz = (Math.sin(decl) * Math.cos(latRad) - Math.cos(decl) * Math.sin(latRad) * Math.cos(omegaRad)) / Math.cos(altitudeRad);
            const clampedCosAz = Math.max(-1.0, Math.min(1.0, cosAz));
            const azFromSouth = this.rad2deg(Math.acos(clampedCosAz));
            
            if (omegaDeg > 0) {
                // Afternoon: Sun is towards West
                azimuthDeg = 180.0 + azFromSouth;
            } else {
                // Morning: Sun is towards East
                azimuthDeg = 180.0 - azFromSouth;
            }
            azimuthDeg = (azimuthDeg + 360.0) % 360.0;
        }

        // Extraterrestrial Normal Solar Irradiance G_on (W/m²)
        const r_correction = 1.0 + 0.033 * Math.cos((2 * Math.PI * d) / 365.0);
        const G_on = this.G_SC * r_correction;

        return {
            dayOfYear: d,
            solarTimeHours: solarTimeHours,
            declinationDeg: this.rad2deg(decl),
            hourAngleDeg: omegaDeg,
            altitudeDeg: Math.max(0, altitudeDeg),
            zenithDeg: zenithDeg,
            azimuthDeg: azimuthDeg,
            isSunUp: altitudeDeg > 0,
            G_on: G_on,
            airMass: altitudeDeg > 0 ? (1.0 / (cosZenith + 0.50572 * Math.pow(6.07995 + altitudeDeg, -1.6364))) : 0
        };
    }

    /**
     * Calculates clear-sky and weather-attenuated GHI, DNI, DHI, and Outdoor Lux
     * @param {Object} solarPos - Object from calculateSolarPosition
     * @param {string} weather - "sunny", "partly_cloudy", "cloudy", "overcast", "rainy"
     * @param {number} cloudFactor - 0.0 (crystal clear) to 1.0 (dense storm clouds)
     */
    static calculateIrradiance(solarPos, weather = "sunny", cloudFactor = 0.0) {
        if (!solarPos.isSunUp || solarPos.altitudeDeg <= 0) {
            return {
                GHI: 0.0,
                DNI: 0.0,
                DHI: 0.0,
                outdoorLux: 0.0,
                clearnessIndex: 0.0,
                weatherLabel: weather
            };
        }

        const altRad = this.deg2rad(solarPos.altitudeDeg);
        const am = solarPos.airMass;

        // Clear-Sky Direct Normal Irradiance DNI_clear (Meinel & Meinel / Haurwitz model)
        // DNI_clear = G_on * 0.7^(am^0.678)
        let DNI_clear = solarPos.G_on * Math.pow(0.7, Math.pow(am, 0.678));
        DNI_clear = Math.max(0, DNI_clear);

        // Clear-Sky Diffuse Horizontal Irradiance DHI_clear
        let DHI_clear = 0.095 * solarPos.G_on * Math.sin(altRad);

        // Adjust for weather/cloud cover
        let cloudAttenDNI = 1.0;
        let cloudDiffuseBoost = 1.0;

        switch (weather) {
            case "sunny":
                cloudAttenDNI = 1.0 - 0.1 * cloudFactor;
                cloudDiffuseBoost = 1.0 + 0.1 * cloudFactor;
                break;
            case "partly_cloudy":
                cloudAttenDNI = 0.55 - 0.3 * cloudFactor;
                cloudDiffuseBoost = 1.6 - 0.2 * cloudFactor;
                break;
            case "cloudy":
                cloudAttenDNI = 0.15 - 0.1 * cloudFactor;
                cloudDiffuseBoost = 1.4 - 0.4 * cloudFactor;
                break;
            case "overcast":
                cloudAttenDNI = 0.02;
                cloudDiffuseBoost = 0.6 - 0.3 * cloudFactor;
                break;
            case "rainy":
                cloudAttenDNI = 0.00;
                cloudDiffuseBoost = 0.35 - 0.2 * cloudFactor;
                break;
            default:
                cloudAttenDNI = Math.max(0.0, 1.0 - cloudFactor);
                break;
        }

        const DNI = Math.max(0, DNI_clear * Math.max(0, cloudAttenDNI));
        const DHI = Math.max(5.0, DHI_clear * cloudDiffuseBoost);

        // Global Horizontal Irradiance GHI = DNI * sin(altitude) + DHI
        const GHI = DNI * Math.sin(altRad) + DHI;

        // Photometric conversion to Outdoor Lux
        // Direct Beam Lux = DNI * sin(alt) * Luminous Efficacy
        // Diffuse Sky Lux = DHI * Luminous Efficacy
        const directLux = DNI * Math.sin(altRad) * this.LUMINOUS_EFFICACY_DIRECT;
        const diffuseLux = DHI * this.LUMINOUS_EFFICACY_DIFFUSE;
        const outdoorLux = directLux + diffuseLux;

        const clearnessIndex = solarPos.G_on > 0 ? (GHI / (solarPos.G_on * Math.sin(altRad) + 1e-4)) : 0;

        return {
            GHI: Math.round(GHI * 10) / 10,
            DNI: Math.round(DNI * 10) / 10,
            DHI: Math.round(DHI * 10) / 10,
            outdoorLux: Math.round(outdoorLux),
            clearnessIndex: Math.min(1.0, Math.max(0.0, clearnessIndex)),
            directLux: Math.round(directLux),
            diffuseLux: Math.round(diffuseLux),
            weatherLabel: weather
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarMath;
}
