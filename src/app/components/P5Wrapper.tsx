import { useRef, useEffect } from "react";
import p5 from "p5";
import useAiStore from "@/store/aiStore";

interface P5Instance extends p5 {
  updateWithProps: (props: {colorPalette: string[] }) => void;
}

type P5WrapperProps = {
  sketch: (p: P5Instance) => void;
};

export default function P5Wrapper({ sketch }: P5WrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const P5InstanceRef = useRef<P5Instance | null>(null);

  const { colorPalette } = useAiStore();

  useEffect(() => {
    if (containerRef.current) {
      P5InstanceRef.current = new p5(sketch, containerRef.current) as P5Instance;
    }

    return () => {
      P5InstanceRef.current?.remove();
      P5InstanceRef.current = null;
    };
  }, [sketch]); 

  useEffect(() => {
    if (P5InstanceRef.current && colorPalette) {
      P5InstanceRef.current.updateWithProps({ colorPalette });
    }
  }, [colorPalette]); 

  return <div ref={containerRef}></div>;
}
