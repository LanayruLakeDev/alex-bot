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

type Page = {
  id: string;
  pageId: string;
  pageName: string;
  accessToken: string;
  isEnabled: boolean;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
    setEditedPrompt("");
  };

  const savePrompt = async () => {
    if (!editingPage) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/pages/${editingPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: editedPrompt }),
      });

      if (res.ok) {
        await fetchPages();
        closeDialog();
      } else {
        console.error("Failed to save:", await res.text());
        alert("Failed to save prompt. Please try again.");
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
      alert("Error saving prompt. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
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
                            <div className="space-y-3">
                              <Label htmlFor="prompt" className="text-base font-semibold">
                                System Prompt
                              </Label>
                              <Textarea
                                id="prompt"
                                value={editedPrompt}
                                onChange={(e) => setEditedPrompt(e.target.value)}
                                className="min-h-[60vh] font-mono text-sm leading-relaxed resize-none focus:ring-2"
                                placeholder="Enter system prompt..."
                              />
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
