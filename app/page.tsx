"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Page = {
  id: string;
  pageId: string;
  pageName: string;
  accessToken: string;
  isEnabled: boolean;
  aiModel: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [selectedAiModel, setSelectedAiModel] = useState("llama");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiModelUpdating, setAiModelUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/pages");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAiModelQuick = async (page: Page, model: string) => {
    if (page.aiModel === model) return;

    try {
      setAiModelUpdating(page.id);
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiModel: model }),
      });

      const responseText = await res.text();
      console.log("⚙️ Quick model switch status:", res.status, responseText);

      if (!res.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        toast.error("Failed to update AI model", {
          description: errorData.details || errorData.error || "Please try again",
        });
        return;
      }

      setPages((prev) =>
        prev.map((p) =>
          p.id === page.id
            ? {
                ...p,
                aiModel: model,
              }
            : p,
        ),
      );

      toast.success("AI model updated", {
        description: `Switched ${page.pageName} to ${model === "gemini" ? "✨ Gemini" : "🦙 Llama"}`,
      });
    } catch (error) {
      console.error("Error updating AI model:", error);
      toast.error("Error updating AI model", {
        description: error instanceof Error ? error.message : "Network error. Please check your connection.",
      });
    } finally {
      setAiModelUpdating(null);
    }
  };

  const toggleBot = async (page: Page) => {
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !page.isEnabled }),
      });

      if (res.ok) {
        fetchPages();
      }
    } catch (error) {
      console.error("Error toggling bot:", error);
    }
  };

  const openEditDialog = (page: Page) => {
    setEditingPage(page);
    setEditedPrompt(page.systemPrompt);
    setSelectedAiModel(page.aiModel || "llama");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
    setEditedPrompt("");
    setSelectedAiModel("llama");
  };

  const savePrompt = async () => {
    if (!editingPage) return;

    setIsSaving(true);
    try {
      console.log('💾 Saving prompt for:', editingPage.pageName);
      console.log('📝 Data:', { systemPrompt: editedPrompt.substring(0, 50) + '...', aiModel: selectedAiModel });
      
      const res = await fetch(`/api/pages/${editingPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          systemPrompt: editedPrompt,
          aiModel: selectedAiModel 
        }),
      });

      const responseText = await res.text();
      console.log('📡 Response status:', res.status);
      console.log('📡 Response body:', responseText);

      if (res.ok) {
        await fetchPages();
        closeDialog();
        toast.success("Prompt saved successfully! 🎉", {
          description: `Updated ${editingPage.pageName} with ${selectedAiModel === 'gemini' ? '✨ Gemini' : '🦙 Llama'}`,
        });
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        console.error("Failed to save:", errorData);
        toast.error("Failed to save prompt", {
          description: errorData.details || errorData.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Error saving prompt", {
        description: error instanceof Error ? error.message : "Network error. Please check your connection.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-6 h-6 w-52 rounded bg-muted" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[2fr,2fr,1.5fr,1fr,1fr,1.2fr] items-center gap-4 rounded-md border bg-muted/50 p-4"
                >
                  <div className="h-4 rounded bg-muted" />
                  <div className="h-4 rounded bg-muted" />
                  <div className="h-9 rounded bg-muted" />
                  <div className="h-6 w-20 rounded-full bg-muted" />
                  <div className="h-5 w-12 rounded bg-muted" />
                  <div className="h-9 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Messenger Bot Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className="text-muted-foreground">No bots configured yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Name</TableHead>
                  <TableHead>Page ID</TableHead>
                  <TableHead>AI Model (Quick Switch)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enable/Disable</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      {page.pageName}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {page.pageId}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={page.aiModel || "llama"}
                        onValueChange={(value) => updateAiModelQuick(page, value)}
                        disabled={aiModelUpdating === page.id}
                      >
                        <SelectTrigger className="w-[220px]">
                          <SelectValue placeholder="Select AI Model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llama">🦙 Llama 4 Maverick (Groq - Fast & Free)</SelectItem>
                          <SelectItem value="gemini">✨ Gemini 2.5 Flash Lite (Google - Advanced)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Switch models instantly — prompt edit not required.
                      </p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          "px-2 py-1 rounded-full text-xs " +
                          (page.isEnabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800")
                        }
                      >
                        {page.isEnabled ? "Active" : "Disabled"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={page.isEnabled}
                        onCheckedChange={() => toggleBot(page)}
                      />
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && editingPage?.id === page.id} onOpenChange={(open) => {
                        if (!open) closeDialog();
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(page)}
                          >
                            Edit Prompt
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0">
                          <DialogHeader className="px-6 py-4 border-b">
                            <DialogTitle className="text-xl">
                              Edit System Prompt - {page.pageName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="aiModel" className="text-base font-semibold">
                                  AI Model
                                </Label>
                                <Select value={selectedAiModel} onValueChange={setSelectedAiModel}>
                                  <SelectTrigger className="w-full mt-2">
                                    <SelectValue placeholder="Select AI Model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="llama">
                                      🦙 Llama 4 Maverick (Groq - Fast & Free)
                                    </SelectItem>
                                    <SelectItem value="gemini">
                                      ✨ Gemini 2.5 Flash Lite (Google - Advanced)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="prompt" className="text-base font-semibold">
                                  System Prompt
                                </Label>
                                <Textarea
                                  id="prompt"
                                  value={editedPrompt}
                                  onChange={(e) => setEditedPrompt(e.target.value)}
                                  className="min-h-[52vh] font-mono text-sm leading-relaxed resize-none focus:ring-2 mt-2"
                                  placeholder="Enter system prompt..."
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                            <Button
                              variant="outline"
                              onClick={closeDialog}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                            <Button onClick={savePrompt} disabled={isSaving} className="px-6">
                              {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
