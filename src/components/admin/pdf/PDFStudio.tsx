import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmailManagement } from "@/hooks/admin/use-email-management";
import { supabase } from "@/integrations/supabase/client";
import CanvasDesigner, { CanvasDesignerRef } from "@/components/designer/CanvasDesigner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { APP_LOGO } from "@/constants/app-assets";

interface PdfTheme {
  title?: string;
  logoUrl?: string;
  primaryColor?: string; // hex
  margin?: number; // pts
}

export const PDFStudio = () => {
  const { settings, updateSetting, fetchSettings } = useEmailManagement();

  const initialTheme = useMemo<PdfTheme>(() => {
    const themeSetting = settings.find((s) => s.setting_key === "pdf_theme");
    return {
      title: themeSetting?.setting_value?.title ?? "",
      logoUrl: themeSetting?.setting_value?.logoUrl ?? APP_LOGO.url,
      primaryColor: themeSetting?.setting_value?.primaryColor ?? "#111827",
      margin: themeSetting?.setting_value?.margin ?? 40,
    } as PdfTheme;
  }, [settings]);

  const [theme, setTheme] = useState<PdfTheme>(initialTheme);
  const [docTitle, setDocTitle] = useState("")
  const [docBody, setDocBody] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const designerRef = useRef<CanvasDesignerRef>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [orderId, setOrderId] = useState("");
  const variableList = useMemo(() => (
    [
      "order_id",
      "order_title",
      "order_date",
      "order_location",
      "host_name",
      "vendor_name",
      "guests",
      "subtotal",
      "order_total",
      "services_list",
    ]
  ), []);

  const emailStyleTemplate = useMemo(() => `
<div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111827; font-size:12pt; line-height:1.5;">
  <header style="display:flex; align-items:center; gap:12px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; margin-bottom:20px;">
    <img src="${theme.logoUrl || APP_LOGO.url}" alt="Cater Directly Logo" style="height:36px; object-fit:contain;" />
    <div style="font-weight:700; font-size:14pt;">Order Confirmation</div>
  </header>
  <section style="margin-bottom:16px;">
    <div style="color:#6b7280;">Order ID</div>
    <div style="font-weight:600;">{{order_id}}</div>
  </section>
  <section style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
    <div><div style="color:#6b7280;">Title</div><div style="font-weight:600;">{{order_title}}</div></div>
    <div><div style="color:#6b7280;">Date</div><div style="font-weight:600;">{{order_date}}</div></div>
    <div><div style="color:#6b7280;">Location</div><div style="font-weight:600;">{{order_location}}</div></div>
    <div><div style="color:#6b7280;">Host</div><div style="font-weight:600;">{{host_name}}</div></div>
    <div><div style="color:#6b7280;">Vendor</div><div style="font-weight:600;">{{vendor_name}}</div></div>
    <div><div style="color:#6b7280;">Guests</div><div style="font-weight:600;">{{guests}}</div></div>
  </section>
  <section style="margin-top:8px;">
    <div style="font-weight:700; margin-bottom:8px;">Order Items</div>
    <div style="white-space:pre-wrap; color:#374151;">{{services_list}}</div>
  </section>
  <section style="margin-top:24px; display:flex; justify-content:flex-end;">
    <div style="min-width:260px;">
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-top:1px solid #e5e7eb;">
        <span style="color:#6b7280;">Subtotal</span><span>{{subtotal}}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; font-weight:700; border-top:1px solid #e5e7eb;">
        <span>Total</span><span>$ {{order_total}}</span>
      </div>
    </div>
  </section>
</div>
`, [theme.logoUrl]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  const saveTheme = async () => {
    await updateSetting("pdf_theme", theme);
  };

  const design = useMemo(() => settings.find((s) => s.setting_key === "pdf_design_json")?.setting_value, [settings]);
  const designOptions = useMemo(() => settings.filter((s) => s.setting_key.startsWith("pdf_design_") || s.setting_key === "pdf_design_json"), [settings]);

  // Include the current system Order PDF (code-based) as a selectable starter layout
  type DesignChoice = { key: string; label: string; from: 'email_settings' | 'system'; json?: any };
  const systemOrderDesign: any = useMemo(() => ({
    version: "6.0.0",
    objects: [
      { type: "rect", left: 0, top: 0, width: 612, height: 100, fill: "#0F172A" },
      { type: "rect", left: 0, top: 100, width: 612, height: 3, fill: "#F59E0B" },
      { type: "textbox", left: 40, top: 36, text: "CaterDirectly", fontSize: 22, fill: "#FFFFFF", fontWeight: "bold" },
      { type: "textbox", left: 40, top: 130, text: "{{order_title}}", fontSize: 18, fill: "#111827", fontWeight: "bold", width: 532 },
      { type: "textbox", left: 40, top: 158, text: "Date: {{order_date}}", fontSize: 12, fill: "#374151" },
      { type: "textbox", left: 40, top: 176, text: "Location: {{order_location}}", fontSize: 12, fill: "#374151" },
      { type: "textbox", left: 40, top: 212, text: "Ordered Services", fontSize: 14, fill: "#111827", fontWeight: "bold" },
      { type: "textbox", left: 40, top: 236, text: "{{services_list}}", fontSize: 12, fill: "#374151", width: 532 },
      { type: "textbox", left: 452, top: 720, text: "Total: ${{order_total}}", fontSize: 14, fill: "#0F172A", fontWeight: "bold" }
    ]
  }), []);

  const designChoices: DesignChoice[] = useMemo(() => {
    const emailDesigns: DesignChoice[] = designOptions.map((opt) => ({
      key: opt.setting_key,
      label: (opt.setting_key.replace("pdf_design_", "").replace(/_/g, " ")) || "Default",
      from: 'email_settings',
      json: opt.setting_value,
    }));
    const systemChoice: DesignChoice = {
      key: 'system_order_pdf',
      label: 'System Order PDF (code-based)',
      from: 'system',
      json: systemOrderDesign,
    };
    // Always include system template so teams can start from the current live format
    return [...emailDesigns, systemChoice];
  }, [designOptions, systemOrderDesign]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf-preview", {
        body: {
          type: "document",
          title: docTitle || theme.title || "",
          body: docBody,
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
      console.error("PDF preview error", e);
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (name: string) => {
    setDocBody((prev) => prev + `{{${name}}}`);
  };

  const replaceVars = (input: string, vars: Record<string, any>) =>
    input.replace(/\{\{(\w+)\}\}/g, (_m, k) => (vars[k] ?? "") + "");

  const loadEmailTemplate = () => {
    if (!docTitle) setDocTitle("Order {{order_id}} — {{order_title}}");
    setDocBody(emailStyleTemplate);
    if (!theme.logoUrl) setTheme((t) => ({ ...t, logoUrl: APP_LOGO.url }));
  };

  const previewWithOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      if (error) throw error;

      let hostName = "";
      if (order?.host_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name,last_name")
          .eq("id", order.host_id)
          .single();
        hostName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
      }

      const formatCurrency = (n: any) => {
        const num = Number(n);
        if (isNaN(num)) return "";
        return num.toFixed(2);
      };

      let servicesList = "";
      let subtotalCalc: number | null = null;

      const tryParse = (val: any) => {
        if (!val) return null;
        if (typeof val === "object") return val;
        try { return JSON.parse(val); } catch { return null; }
      };

      const splitDetails = tryParse(order?.order_splitting_details);
      if (splitDetails && typeof splitDetails === "object") {
        const lines: string[] = [];
        let sum = 0;
        for (const v of Object.values(splitDetails as Record<string, any>)) {
          if ((v as any)?.vendor_name) lines.push(`${(v as any).vendor_name}:`);
          if (Array.isArray((v as any)?.services)) {
            for (const s of (v as any).services) {
              const parts: string[] = [];
              if (s?.name) parts.push(s.name);
              if (s?.quantity) parts.push(`x${s.quantity}`);
              if (s?.price) parts.push(`$${formatCurrency(s.price)}`);
              if (parts.length) lines.push(`• ${parts.join(" ")}`);
            }
          }
          if (typeof (v as any)?.subtotal === "number") sum += (v as any).subtotal;
        }
        servicesList = lines.join("\n");
        subtotalCalc = sum > 0 ? sum : null;
      }

      // Fallback: try to parse service_details text if present
      if (!servicesList) {
        const details = tryParse(order?.service_details);
        if (details && Array.isArray(details?.menuItems)) {
          servicesList = details.menuItems.map((it: any) => `• ${it.name || "Item"}${it.price ? ` - $${formatCurrency(it.price)}` : ""}`).join("\n");
        }
      }

      const vars = {
        order_id: order?.id ?? "",
        order_title: order?.title ?? "",
        order_date: order?.date ?? "",
        order_location: order?.location ?? "",
        host_name: hostName ?? "",
        vendor_name: order?.vendor_name ?? "",
        guests: order?.guests ?? "",
        subtotal: subtotalCalc != null ? formatCurrency(subtotalCalc) : (order?.price != null ? formatCurrency(order.price) : ""),
        order_total: order?.price != null ? formatCurrency(order.price) : "",
        services_list: servicesList,
      } as Record<string, any>;

      const title = replaceVars(docTitle || "Order {{order_id}} — {{order_title}}", vars);
      const body = replaceVars(docBody || emailStyleTemplate, vars);

      const { data, error: fnError } = await supabase.functions.invoke("generate-pdf-preview", {
        body: {
          type: "document",
          title,
          body,
          theme: { ...theme, logoUrl: theme.logoUrl || APP_LOGO.url },
        },
      });
      if (fnError) throw fnError;
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
      console.error("Preview with order variables error", e);
    } finally {
      setLoading(false);
    }
  };

  const saveDesign = async () => {
    const json = designerRef.current?.getJSON();
    if (json) await updateSetting("pdf_design_json", json);
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
      console.error("Canvas PDF preview error", e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Documents (PDF) Studio</h2>
        <p className="text-muted-foreground text-sm">Design your PDF theme and generate real previews before sending or exporting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme-title">Default Title</Label>
              <Input id="theme-title" value={theme.title ?? ""} onChange={(e) => setTheme((t) => ({ ...t, title: e.target.value }))} />
            </div>
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
              <Input id="margin" type="number" value={theme.margin ?? 40} onChange={(e) => setTheme((t) => ({ ...t, margin: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={saveTheme}>Save Theme</Button>
              <Button onClick={generatePreview} disabled={loading}>{loading ? "Generating..." : "Generate Preview"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="doc-title">Title</Label>
              <Input id="doc-title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Order {{order_id}} — {{order_title}}" />
            </div>
            <div>
              <Label htmlFor="doc-body">Body</Label>
              <Textarea id="doc-body" value={docBody} onChange={(e) => setDocBody(e.target.value)} placeholder="Details to include in the PDF..." className="min-h-[200px]" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Insert variable</div>
              <div className="flex flex-wrap gap-2">
                {variableList.map((v) => (
                  <Button key={v} size="sm" variant="outline" onClick={() => insertVariable(v)}>
                    {`{{${v}}}`}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={loadEmailTemplate}>Load Cater Directly Order template</Button>
              <div className="flex items-center gap-2">
                <Input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-[260px]" />
                <Button onClick={previewWithOrder} disabled={loading || !orderId}>{loading ? "Generating..." : "Preview with Order Variables"}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Designer */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Designer (beta)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CanvasDesigner ref={designerRef} initialDesign={design} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveDesign}>Save Design</Button>
            <Button variant="outline" onClick={() => setPickerOpen(true)}>Load Saved Design</Button>
            <Button variant="outline" onClick={() => designerRef.current?.clearAll()}>Reset Canvas</Button>
            <Button onClick={previewCanvasAsPDF} disabled={loading}>{loading ? "Generating..." : "Preview Canvas as PDF"}</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a saved PDF design</DialogTitle>
            <DialogDescription>
              Pick from saved designs or start from the live system order layout. Loading replaces the current canvas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {designChoices.length === 0 && (
              <div className="text-sm text-muted-foreground">No saved designs found.</div>
            )}
            {designChoices.map((choice) => (
              <div key={choice.key} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{choice.label}</div>
                  <span className="text-xs text-muted-foreground">{choice.from === 'system' ? 'system' : 'saved'}</span>
                </div>
                <Button size="sm" onClick={() => { if (choice.json) { designerRef.current?.loadJSON(choice.json); } setPickerOpen(false); }}>Load</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>PDF Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {previewUrl ? (
            <iframe title="PDF Preview" src={previewUrl} className="w-full h-[700px] border rounded" />
          ) : (
            <div className="text-muted-foreground text-sm">Generate a preview to see the result here.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFStudio;
