import p5 from "p5";
import { type Scene } from "./types";
import { type AiAnalysis } from "@/store/aiStore";

export class DominantObjectScene implements Scene {
  private p: p5;
  private analysis: AiAnalysis | null = null;
  
  private position: p5.Vector;
  private baseSize: number = 0;
  private color: p5.Color;
  
  constructor(p: p5) {
    this.p = p;
    this.position = this.p.createVector(0, 0);
    this.color = this.p.color(255);
  }

  rebuild(analysis: AiAnalysis): void {
    this.analysis = analysis;
    const params = analysis.dominantObjectParams;
    if (!params) return;

    this.position.set(
      params.position.x * this.p.width,
      params.position.y * this.p.height
    );
    this.baseSize = params.size * this.p.width;
    this.color = this.p.color(analysis.visuals.colorPalette.accent1);
  }

  draw(): void {
    if (!this.analysis || !this.analysis.dominantObjectParams) return;
    
    const params = this.analysis.dominantObjectParams;

    const pulseIntensity = params.pulsation.intensity * (this.baseSize * 0.2);
    const pulseSpeed = params.pulsation.speed * this.p.frameCount * 0.05;
    const currentSize = this.baseSize + this.p.sin(pulseSpeed) * pulseIntensity;

    this.p.noStroke();
    this.p.fill(this.color);

    if (params.texture === 'noisy') {
        const grain = this.p.random(-10, 10);
        const noisyColor = this.p.color(
          this.p.red(this.color) + grain,
          this.p.green(this.color) + grain,
          this.p.blue(this.color) + grain
        );
        this.p.fill(noisyColor);
    }

    switch (params.shape) {
        case 'quad':
            this.p.rect(this.position.x, this.position.y, currentSize, currentSize);
            break;
        case 'triangle':
            const r = currentSize / 2;
            this.p.triangle(
              this.position.x, this.position.y - r,
              this.position.x - r, this.position.y + r,
              this.position.x + r, this.position.y + r
            );
            break;
        case 'circle':
        default:
            this.p.ellipse(this.position.x, this.position.y, currentSize, currentSize);
            break;
    }
  }
}