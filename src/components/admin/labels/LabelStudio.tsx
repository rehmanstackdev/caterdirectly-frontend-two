import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmailManagement } from "@/hooks/admin/use-email-management";
import { supabase } from "@/integrations/supabase/client";
import CanvasDesigner, { CanvasDesignerRef } from "@/components/designer/CanvasDesigner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface LabelTheme {
  logoUrl?: string;
  primaryColor?: string;
  margin?: number;
}

export const LabelStudio = () => {
  const { settings, updateSetting, fetchSettings } = useEmailManagement();

  const initialTheme = useMemo<LabelTheme>(() => {
    const themeSetting = settings.find((s) => s.setting_key === "label_theme");
    return {
      logoUrl: themeSetting?.setting_value?.logoUrl ?? "",
      primaryColor: themeSetting?.setting_value?.primaryColor ?? "#111827",
      margin: themeSetting?.setting_value?.margin ?? 10,
    } as LabelTheme;
  }, [settings]);

  const [theme, setTheme] = useState<LabelTheme>(initialTheme);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const designerRef = useRef<CanvasDesignerRef>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [adminDesigns, setAdminDesigns] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    const loadAdminDesigns = async () => {
      if (!pickerOpen) return;
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .or('setting_key.like.label_design_%,setting_key.eq.label_design_json');
        if (error) throw error;
        setAdminDesigns(data ?? []);
      } catch (e) {
        console.error('Failed to fetch admin label designs', e);
      }
    };
    loadAdminDesigns();
  }, [pickerOpen]);

  const saveTheme = async () => {
    await updateSetting("label_theme", theme);
  };

  const design = useMemo(() => settings.find((s) => s.setting_key === "label_design_json")?.setting_value, [settings]);
  const designOptions = useMemo(() => settings.filter((s) => s.setting_key.startsWith("label_design_") || s.setting_key === "label_design_json"), [settings]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf-preview", {
        body: {
          type: "label",
          fields: { name, address, note },
          theme,
        },
      });
      if (error) throw error;
      const pdfBase64 = (data as any)?.pdfBase64 as string;
      if (pdfBase64) {
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (e) {
      console.error("Label preview error", e);
    } finally {
      setLoading(false);
    }
  };

  const saveDesign = async () => {
    const json = designerRef.current?.getJSON();
    if (json) await updateSetting("label_design_json", json);
  };

  const previewCanvasAsPDF = async () => {
    if (!designerRef.current) return;
    setLoading(true);
    try {
      const png = designerRef.current.exportPNG();
      const { w, h } = designerRef.current.getSize();
      if (!png) return;
      const { data, error } = await supabase.functions.invoke("generate-pdf-preview", {
        body: { type: "imagePages", images: [png], pageSize: { width: w, height: h } },
      });
      if (error) throw error;
      const pdfBase64 = (data as any)?.pdfBase64 as string;
      if (pdfBase64) {
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (e) {
      console.error("Canvas label preview error", e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Labels Studio</h2>
        <p className="text-muted-foreground text-sm">Design 4x6" labels and preview them before printing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input id="logo-url" value={theme.logoUrl ?? ""} onChange={(e) => setTheme((t) => ({ ...t, logoUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="primary-color">Primary Color (hex)</Label>
              <Input id="primary-color" type="text" value={theme.primaryColor ?? "#111827"} onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="margin">Margin (pt)</Label>
              <Input id="margin" type="number" value={theme.margin ?? 10} onChange={(e) => setTheme((t) => ({ ...t, margin: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={saveTheme}>Save Theme</Button>
              <Button onClick={generatePreview} disabled={loading}>{loading ? "Generating..." : "Generate Preview"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Label Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Recipient Name" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, ST 00000" />
            </div>
            <div>
              <Label htmlFor="note">Note</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Designer */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Label Designer (beta)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CanvasDesigner ref={designerRef} initialWidth={288} initialHeight={432} initialDesign={design} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveDesign}>Save Design</Button>
            <Button variant="outline" onClick={() => setPickerOpen(true)}>Load Saved Design</Button>
            <Button variant="outline" onClick={() => designerRef.current?.clearAll()}>Reset Canvas</Button>
            <Button onClick={previewCanvasAsPDF} disabled={loading}>{loading ? "Generating..." : "Preview Canvas as PDF"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Label PDF Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {previewUrl ? (
            <iframe title="Label Preview" src={previewUrl} className="w-full h-[700px] border rounded" />
          ) : (
            <div className="text-muted-foreground text-sm">Generate a preview to see the label here.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a saved Label design</DialogTitle>
            <DialogDescription>
              Pick from saved designs. Loading replaces the current canvas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {designOptions.length === 0 && adminDesigns.length === 0 && (
              <div className="text-sm text-muted-foreground">No saved designs found.</div>
            )}
            {designOptions.map((opt) => {
              const label = opt.setting_key.replace("label_design_", "").replace(/_/g, " ") || "Default";
              return (
                <div key={opt.setting_key} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{label}</div>
                    <span className="text-xs text-muted-foreground">saved</span>
                  </div>
                  <Button size="sm" onClick={() => { designerRef.current?.loadJSON(opt.setting_value); setPickerOpen(false); }}>Load</Button>
                </div>
              );
            })}
            {adminDesigns.map((opt) => {
              const label = (opt.setting_key as string).replace("label_design_", "").replace(/_/g, " ") || "Default";
              return (
                <div key={`admin_${opt.setting_key}`} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{label}</div>
                    <span className="text-xs text-muted-foreground">admin</span>
                  </div>
                  <Button size="sm" onClick={() => { designerRef.current?.loadJSON(opt.setting_value); setPickerOpen(false); }}>Load</Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabelStudio;
