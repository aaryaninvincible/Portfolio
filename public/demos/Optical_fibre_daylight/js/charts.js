/**
 * RealTimeTelemetryCharts - Multi-channel High Performance Canvas Charting Engine
 * 
 * Provides:
 *  1. Irradiance & Illuminance History (GHI, DNI vs Outdoor/Indoor Lux)
 *  2. Power Balance & LED Dimming Response (Daylight Lux vs LED Power Watts)
 *  3. Thermal & Tracking Stability (Focal Temp °C & Tracking Error °)
 *  4. Energy Savings & Cumulative Carbon Offset (kWh Saved vs Baseline)
 */

class TelemetryCharts {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.history = {
            times: [],
            ghi: [],
            dni: [],
            daylightLux: [],
            indoorLux: [],
            targetLux: [],
            ledPower: [],
            baselineLEDPower: [],
            focalTemp: [],
            energySavedPercent: []
        };
        this.maxPoints = 80;
        this.activeTab = 'power_lux'; // 'power_lux' | 'solar_irr' | 'thermal' | 'energy_eco'
    }

    setTab(tabName) {
        this.activeTab = tabName;
        this.render();
    }

    pushData(timeLabel, data) {
        this.history.times.push(timeLabel);
        this.history.ghi.push(data.irradiance.GHI);
        this.history.dni.push(data.irradiance.DNI);
        this.history.daylightLux.push(data.lighting.daylightLux);
        this.history.indoorLux.push(data.lighting.totalIndoorLux);
        this.history.targetLux.push(data.lighting.targetLux);
        this.history.ledPower.push(data.lighting.ledElectricalPower);
        this.history.baselineLEDPower.push(data.lighting.baselineLEDPower);
        this.history.focalTemp.push(data.opticalThermal.focalTemp);
        this.history.energySavedPercent.push(data.lighting.energySavingPercent);

        if (this.history.times.length > this.maxPoints) {
            Object.keys(this.history).forEach(key => this.history[key].shift());
        }

        this.render();
    }

    clear() {
        Object.keys(this.history).forEach(key => this.history[key] = []);
        this.render();
    }

    render() {
        if (!this.container) return;
        const canvas = this.container.querySelector('canvas') || document.createElement('canvas');
        if (!this.container.contains(canvas)) {
            this.container.appendChild(canvas);
        }

        const rect = this.container.getBoundingClientRect();
        const w = rect.width || 800;
        const h = rect.height || 220;

        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, w, h);

        const padding = { top: 30, right: 40, bottom: 30, left: 55 };
        const plotW = w - padding.left - padding.right;
        const plotH = h - padding.top - padding.bottom;

        // Draw Plot Grid & Axes
        this.drawGrid(ctx, padding, plotW, plotH, w, h);

        const n = this.history.times.length;
        if (n < 2) {
            ctx.fillStyle = '#64748b';
            ctx.font = '12px "Inter", sans-serif';
            ctx.fillText("Awaiting continuous simulation telemetry data...", w / 2 - 120, h / 2);
            return;
        }

        // Render Active Chart Series
        switch (this.activeTab) {
            case 'power_lux':
                this.renderPowerLuxChart(ctx, padding, plotW, plotH, n);
                break;
            case 'solar_irr':
                this.renderSolarIrrChart(ctx, padding, plotW, plotH, n);
                break;
            case 'thermal':
                this.renderThermalChart(ctx, padding, plotW, plotH, n);
                break;
            case 'energy_eco':
                this.renderEnergyEcoChart(ctx, padding, plotW, plotH, n);
                break;
        }
    }

    drawGrid(ctx, pad, pw, ph, w, h) {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;

        // 4 Horizontal Grid Lines
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (ph / 4) * i;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(pad.left + pw, y);
            ctx.stroke();
        }

        // 5 Vertical Grid Lines
        for (let j = 0; j <= 5; j++) {
            const x = pad.left + (pw / 5) * j;
            ctx.beginPath();
            ctx.moveTo(x, pad.top);
            ctx.lineTo(x, pad.top + ph);
            ctx.stroke();
        }
    }

    renderPowerLuxChart(ctx, pad, pw, ph, n) {
        // Left Axis: Lux (0 to 1000 Lux)
        // Right Axis: LED Power (0 to 70 W)
        const maxLux = 1000;
        const maxPower = 70;

        // 1. Target Lux Line (Dashed Orange)
        this.drawLineSeries(ctx, pad, pw, ph, this.history.targetLux, maxLux, 'rgba(245, 158, 11, 0.6)', 1.5, [4, 4]);

        // 2. Indoor Daylight Lux (Bright Amber Gradient)
        this.drawLineSeries(ctx, pad, pw, ph, this.history.daylightLux, maxLux, '#fbbf24', 2.5);

        // 3. Total Combined Indoor Lux (Green)
        this.drawLineSeries(ctx, pad, pw, ph, this.history.indoorLux, maxLux, '#10b981', 2.0);

        // 4. LED Electrical Power (Pink / Magenta on Right Axis)
        this.drawLineSeries(ctx, pad, pw, ph, this.history.ledPower, maxPower, '#ec4899', 2.0);

        // Axis Labels
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('1000 Lux', 5, pad.top + 4);
        ctx.fillText('500 Lux', 10, pad.top + ph / 2 + 4);
        ctx.fillText('0 Lux', 20, pad.top + ph + 4);

        ctx.fillStyle = '#ec4899';
        ctx.fillText('60 W', pad.left + pw + 8, pad.top + 4);
        ctx.fillText('30 W', pad.left + pw + 8, pad.top + ph / 2 + 4);
        ctx.fillText('0 W', pad.left + pw + 8, pad.top + ph + 4);

        // Time X-Axis Ticks
        if (n > 0) {
            ctx.fillStyle = '#64748b';
            ctx.fillText(this.history.times[0], pad.left, pad.top + ph + 18);
            ctx.fillText(this.history.times[n - 1], pad.left + pw - 30, pad.top + ph + 18);
        }
    }

    renderSolarIrrChart(ctx, pad, pw, ph, n) {
        const maxIrr = 1100; // W/m²
        this.drawLineSeries(ctx, pad, pw, ph, this.history.ghi, maxIrr, '#f59e0b', 2.5);
        this.drawLineSeries(ctx, pad, pw, ph, this.history.dni, maxIrr, '#38bdf8', 2.0);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('1000 W/m²', 2, pad.top + 4);
        ctx.fillText('500 W/m²', 8, pad.top + ph / 2 + 4);
        ctx.fillText('0 W/m²', 18, pad.top + ph + 4);
    }

    renderThermalChart(ctx, pad, pw, ph, n) {
        const maxTemp = 100; // °C
        // Threshold Warning Line at 85°C
        const warnY = pad.top + ph - (85.0 / maxTemp) * ph;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pad.left, warnY);
        ctx.lineTo(pad.left + pw, warnY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.font = '9px "Inter", sans-serif';
        ctx.fillText('85°C SAFE THRESHOLD', pad.left + 10, warnY - 4);

        this.drawLineSeries(ctx, pad, pw, ph, this.history.focalTemp, maxTemp, '#f97316', 2.5);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('100 °C', 10, pad.top + 4);
        ctx.fillText('50 °C', 16, pad.top + ph / 2 + 4);
        ctx.fillText('0 °C', 22, pad.top + ph + 4);
    }

    renderEnergyEcoChart(ctx, pad, pw, ph, n) {
        const maxPct = 100; // %
        this.drawLineSeries(ctx, pad, pw, ph, this.history.energySavedPercent, maxPct, '#10b981', 2.5);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('100 %', 12, pad.top + 4);
        ctx.fillText('50 %', 18, pad.top + ph / 2 + 4);
        ctx.fillText('0 %', 24, pad.top + ph + 4);
    }

    drawLineSeries(ctx, pad, pw, ph, data, maxY, color, lineWidth = 2, dash = []) {
        if (!data || data.length < 2) return;
        const n = data.length;
        const dx = pw / (this.maxPoints - 1);

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(dash);

        ctx.beginPath();
        data.forEach((val, i) => {
            const clamped = Math.max(0, Math.min(maxY, val));
            const x = pad.left + i * dx;
            const y = pad.top + ph - (clamped / maxY) * ph;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelemetryCharts;
}
