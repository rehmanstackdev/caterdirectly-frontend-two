import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Canvas as FabricCanvas, Rect, Circle, Textbox, Image as FabricImage, PencilBrush } from "fabric";

export type CanvasDesignerRef = {
  exportPNG: () => string | null;
  renderWithVariables: (vars: Record<string, string>) => Promise<string | null>;
  getJSON: () => any | null;
  loadJSON: (json: any) => Promise<void>;
  setSize: (w: number, h: number) => void;
  getSize: () => { w: number; h: number };
  clearAll: () => void;
};

interface CanvasDesignerProps {
  initialWidth?: number;
  initialHeight?: number;
  initialDesign?: any;
}

export const CanvasDesigner = forwardRef<CanvasDesignerRef, CanvasDesignerProps>(
  ({ initialWidth = 612, initialHeight = 792, initialDesign }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement | null>(null);
    const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
    const [canvasSize, setCanvasSize] = useState({ w: initialWidth, h: initialHeight });
    const [activeColor, setActiveColor] = useState<string>("#111827");

    useEffect(() => {
      const el = canvasElRef.current;
      if (!el) return;
      if ((el as any)._fabricInitialized) {
        // Prevent double-initialization in React StrictMode
        return;
      }
      (el as any)._fabricInitialized = true;

      const c = new FabricCanvas(el, {
        width: canvasSize.w,
        height: canvasSize.h,
        backgroundColor: "#ffffff",
      });
      // Ensure a brush exists before configuring
      if (!c.freeDrawingBrush) {
        c.freeDrawingBrush = new PencilBrush(c) as any;
      }
      if (c.freeDrawingBrush) {
        c.freeDrawingBrush.color = activeColor as any;
        c.freeDrawingBrush.width = 2 as any;
      }
      setFabricCanvas(c);
      return () => {
        (el as any)._fabricInitialized = false;
        c.dispose();
      };
    }, []);

    // Load initial design once canvas is ready
    useEffect(() => {
      if (!fabricCanvas || !initialDesign) return;
      fabricCanvas.loadFromJSON(initialDesign, () => fabricCanvas.renderAll());
    }, [fabricCanvas, initialDesign]);

    useEffect(() => {
      if (!fabricCanvas) return;
      fabricCanvas.setWidth(canvasSize.w);
      fabricCanvas.setHeight(canvasSize.h);
      fabricCanvas.renderAll();
    }, [canvasSize, fabricCanvas]);

    useEffect(() => {
      if (!fabricCanvas) return;
      if (!fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas) as any;
      }
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = activeColor as any;
      }
    }, [activeColor, fabricCanvas]);

    useImperativeHandle(ref, () => ({
      exportPNG: () => {
        if (!fabricCanvas) return null;
        return fabricCanvas.toDataURL({ format: "png", multiplier: 2 });
      },
      renderWithVariables: async (vars: Record<string, string>) => {
        if (!fabricCanvas) return null;
        // store originals
        const originals: Array<{ obj: any; text: string }> = [];
        fabricCanvas.getObjects().forEach((obj: any) => {
          if (obj.type === "textbox" || obj.type === "text") {
            const t: string = obj.text || "";
            originals.push({ obj, text: t });
            let replaced = t;
            for (const [k, v] of Object.entries(vars)) {
              const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
              replaced = replaced.replace(re, v ?? "");
            }
            obj.text = replaced;
          }
        });
        fabricCanvas.renderAll();
        const url = fabricCanvas.toDataURL({ format: "png", multiplier: 2 });
        // revert
        originals.forEach(({ obj, text }) => (obj.text = text));
        fabricCanvas.renderAll();
        return url;
      },
      getJSON: () => {
        if (!fabricCanvas) return null;
        return fabricCanvas.toJSON();
      },
      loadJSON: async (json: any) => {
        if (!fabricCanvas) return;
        try {
          const payload = typeof json === 'string' ? JSON.parse(json) : json;
          // Clear before loading to avoid stale objects lingering
          fabricCanvas.clear();
          (fabricCanvas as any).backgroundColor = '#ffffff';
          await new Promise<void>((resolve, reject) => {
            try {
              fabricCanvas.loadFromJSON(payload, () => {
                fabricCanvas.renderAll();
                resolve();
              });
            } catch (e) {
              reject(e);
            }
          });
        } catch (e) {
          console.error('Failed to load design JSON', e);
        }
      },
      setSize: (w: number, h: number) => {
        setCanvasSize({ w, h });
      },
      getSize: () => ({ w: canvasSize.w, h: canvasSize.h }),
      clearAll: () => {
        if (!fabricCanvas) return;
        fabricCanvas.clear();
        (fabricCanvas as any).backgroundColor = "#ffffff";
        fabricCanvas.renderAll();
      },
    }));

    const addRect = () => {
      fabricCanvas?.add(
        new Rect({ left: 50, top: 50, fill: activeColor, width: 120, height: 80 })
      );
    };

    const addCircle = () => {
      fabricCanvas?.add(
        new Circle({ left: 120, top: 120, fill: activeColor, radius: 40 })
      );
    };

    const addText = () => {
      fabricCanvas?.add(
        new Textbox("Double-click to edit. Use {{item_name}} and {{dietary_tags}}.", {
          left: 60,
          top: 60,
          width: Math.min(300, canvasSize.w - 80),
          fill: activeColor,
          fontSize: 18,
        })
      );
    };

    const addImageFromUrl = async () => {
      const url = prompt("Enter image URL");
      if (!url || !fabricCanvas) return;
      try {
        const img = await FabricImage.fromURL(url);
        const scale = Math.min(
          (canvasSize.w * 0.6) / img.width,
          (canvasSize.h * 0.6) / img.height
        );
        img.set({ left: 80, top: 80, scaleX: scale, scaleY: scale });
        fabricCanvas.add(img);
      } catch (e) {
        console.error("Failed to add image", e);
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={addRect}>Rectangle</Button>
          <Button variant="outline" onClick={addCircle}>Circle</Button>
          <Button variant="outline" onClick={addText}>Text</Button>
          <Button variant="outline" onClick={addImageFromUrl}>Image from URL</Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="color">Color</Label>
            <Input id="color" type="color" value={activeColor} onChange={(e) => setActiveColor(e.target.value)} className="w-10 p-0 h-9" />
          </div>
          <div className="flex items-center gap-2">
            <Label>Size (pt)</Label>
            <Input type="number" value={canvasSize.w} onChange={(e) => setCanvasSize((s) => ({ ...s, w: Number(e.target.value) }))} className="w-24" />
            <span>×</span>
            <Input type="number" value={canvasSize.h} onChange={(e) => setCanvasSize((s) => ({ ...s, h: Number(e.target.value) }))} className="w-24" />
          </div>
        </div>
        <div className="border border-border rounded-md bg-muted p-4 overflow-auto">
          <div className="inline-block bg-background border border-border shadow-sm">
            <canvas ref={canvasElRef} className="block" />
          </div>
        </div>
      </div>
    );
  }
);

CanvasDesigner.displayName = "CanvasDesigner";

export default CanvasDesigner;
