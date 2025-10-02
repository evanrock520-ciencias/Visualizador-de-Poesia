import p5 from "p5"
import { Delaunay } from "d3-delaunay"
import { Scene } from "./types"
import { AiAnalysis } from "@/store/aiStore"

export class VoronoiScene implements Scene {
    private p: p5;
    private analysis: AiAnalysis | null = null;

    private seedPoints: p5.Vector[] = [];
    private speeds: p5.Vector[] = [];

    constructor(p: p5) {
        this.p = p;
    }

    rebuild(analysis: AiAnalysis): void {
        this.analysis = analysis;
        const params = analysis.voronoiParams;
        if (!params) {
            return;
        }

        this.seedPoints = [];
        this.speeds = [];

        for (let i = 0; i < params.pointCount; i++) {
            let seedPoint = this.p.createVector(
                this.p.random(this.p.width),
                this.p.random(this.p.height) 
            )

            this.seedPoints.push(seedPoint);

            let speed: p5.Vector;
            switch (params.pointMovement) {
                case 'slowDrift':
                    speed = this.p.createVector(this.p.random(-0.5, 0.5), this.p.random(-0.5, 0.5))
                    break;
                case 'jitter':
                    speed = this.p.createVector(0, 0); 
                    break;
                case 'static': 
                default:
                    speed = this.p.createVector(0, 0);
                    break;
            }
            this.speeds.push(speed);
        }

    }

    private _calculateDelaunay(points: p5.Vector[]): Delaunay<p5.Vector> {
        const pointsArray = [];
        for (let v of points) {
            pointsArray.push(v.x, v.y);
        }
        return new Delaunay(pointsArray);
    }   


    draw(): void {
        if (!this.analysis || !this.analysis.voronoiParams) {
            return;
        }

        const params = this.analysis.voronoiParams;
        const visuals = this.analysis.visuals;

        for (let i = 0; i < this.seedPoints.length; i++) {
            
            if (params.pointMovement === 'jitter') {
                const intensity = params.jitterIntensity || 1;
                const jitterForce = p5.Vector.random2D().mult(intensity * visuals.animation.speed * 0.5);
                this.seedPoints[i].add(jitterForce);
            } else {
                this.seedPoints[i].add(this.speeds[i]);
            }

            if (params.pointMovement === 'slowDrift') {
                if (this.seedPoints[i].x < 0 || this.seedPoints[i].x > this.p.width) {
                    this.speeds[i].x *= -1;
                }
                if (this.seedPoints[i].y < 0 || this.seedPoints[i].y > this.p.height) {
                    this.speeds[i].y *= -1;
                }
            }

            this.seedPoints[i].x = this.p.constrain(this.seedPoints[i].x, 0, this.p.width);
            this.seedPoints[i].y = this.p.constrain(this.seedPoints[i].y, 0, this.p.height);
        }

        const delaunay = this._calculateDelaunay(this.seedPoints);
        const voronoi = delaunay.voronoi([0, 0, this.p.width, this.p.height]);
        const polygons = voronoi.cellPolygons();


        for (const poly of polygons) {
            if (!poly) continue;

            switch (params.fillStyle) {
                case 'solid':
                    this.p.fill(visuals.colorPalette.accent1);
                    this.p.noStroke();
                    break;
                case 'transparent':
                    const transparentColor = this.p.color(visuals.colorPalette.accent1);
                    transparentColor.setAlpha(150);
                    this.p.fill(transparentColor);
                    this.p.noStroke();
                    break;
                case 'wireframe':
                default:
                    this.p.noFill();
                    this.p.stroke(visuals.colorPalette.accent1);
                    this.p.strokeWeight(params.thickness || 1);
                    break;
            }

            this.p.beginShape();
            for (let i = 0; i < poly.length; i++) {
                this.p.vertex(poly[i][0], poly[i][1]);
            }
            this.p.endShape(this.p.CLOSE);
        }
    }
}