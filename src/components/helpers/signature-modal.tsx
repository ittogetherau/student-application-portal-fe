"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Point = { x: number; y: number };
type Stroke = Point[];

type SignatureModalProps = {
  open: boolean;
  title?: string;
  onConfirm: (svg: string) => void;
  onOpenChange?: (open: boolean) => void;
};

const SignatureModal = ({
  open,
  onConfirm,
  onOpenChange,
  title = "Add signature",
}: SignatureModalProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const current = useRef<Stroke>([]);

  const getPoint = (e: React.PointerEvent): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const pointerDown = (e: React.PointerEvent) => {
    current.current = [getPoint(e)];
    setStrokes((s) => [...s, current.current]);
  };

  const pointerMove = (e: React.PointerEvent) => {
    if (!current.current.length) return;
    current.current.push(getPoint(e));
    setStrokes((s) => [...s]);
  };

  const pointerUp = () => {
    current.current = [];
  };

  const toPath = (points: Point[]) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const handleClear = () => setStrokes([]);

  const exportSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;

    // Ensure namespace + viewBox for valid standalone SVG in preview/data-URLs
    if (!svg.getAttribute("xmlns")) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    if (!svg.getAttribute("viewBox")) {
      const width = svg.clientWidth || 560;
      const height = svg.clientHeight || 260;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    onConfirm(svgString);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30">
            <svg
              ref={svgRef}
              width="100%"
              height="260"
              className="block w-full"
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerLeave={pointerUp}
            >
              {strokes.map((stroke, i) => (
                <path
                  key={i}
                  d={toPath(stroke)}
                  fill="none"
                  stroke="black"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>
          </div>
        </div>
        <DialogFooter>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" type="button" onClick={handleClear}>
              Clear
            </Button>
            <Button type="button" onClick={exportSvg}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;
