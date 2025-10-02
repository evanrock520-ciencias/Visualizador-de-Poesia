import p5 from "p5"
import { type Scene } from "./types"
import { type AiAnalysis } from "@/store/aiStore"

export class FractalTreeScene implements Scene {
    private p: p5;
    private analysis: AiAnalysis | null = null;

    constructor(p: p5) {
        this.p = p;
    }

    rebuild(analysis: AiAnalysis): void {
        this.analysis = analysis;
    }

    private branch(length: number, angle: number, limit: number, ratio: number) : void {
        this.p.line(0, 0, 0, -length);
        this.p.translate(0, -length);

        this.p.push();
        this.p.rotate(angle);
        if (length > limit) {
            this.branch(length * ratio, angle, limit, ratio);
        }
        this.p.pop();

        this.p.push();
        this.p.rotate(-angle);
        if (length > limit) {
            this.branch(length * ratio, angle, limit, ratio);
        } 

        this.p.pop();

    }

    draw(): void {
        if(!this.analysis || !this.analysis.fractalTreeParams) return;
        const params = this.analysis.fractalTreeParams;
        const visuals = this.analysis.visuals;

        this.p.stroke(visuals.colorPalette.accent1);
        this.p.strokeWeight(params.thickness)


        const animatedAngle = params.angle + (this.p.millis() * visuals.animation.speed * 0.0001);

        this.p.push();
        this.p.translate(this.p.width / 2, this.p.height);
        this.branch(
            this.p.height * params.size,
            animatedAngle,
            params.detail,
            params.branchRatio
        );
        this.p.pop();
    }
}