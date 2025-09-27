import p5 from "p5";
import { AiAnalysis, type Visuals } from "@/store/aiStore";

export interface Scene {
  rebuild(analysis: AiAnalysis): void; 

  draw(): void;
}