import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Type,
  Image,
  Plus,
  Trash2,
  Upload,
  Link2,
  MoveUp,
  MoveDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

export interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  imageAlignment?: "left" | "center" | "right";
  imageSize?: "small" | "medium" | "large" | "full";
}

interface RichContentEditorProps {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  placeholder?: string;
}

export function RichContentEditor({
  value,
  onChange,
  placeholder = "Start writing your content...",
}: RichContentEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Generate unique ID for blocks
  const generateId = () => `block_${Date.now()}_${Math.random()}`;

  // Add new text block
  const addTextBlock = useCallback(() => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type: "text",
      content: "",
    };
    onChange([...value, newBlock]);
  }, [value, onChange]);

  // Add new image block
  const addImageBlock = useCallback(
    (url: string, alt: string = "") => {
      const newBlock: ContentBlock = {
        id: generateId(),
        type: "image",
        content: "",
        imageUrl: url,
        imageAlt: alt,
        imageAlignment: "center",
        imageSize: "medium",
      };
      onChange([...value, newBlock]);
      setImageDialogOpen(false);
      setImageUrl("");
      setImageAlt("");
    },
    [value, onChange],
  );

  // Update block content
  const updateBlock = useCallback(
    (id: string, updates: Partial<ContentBlock>) => {
      const updatedBlocks = value.map((block) =>
        block.id === id ? { ...block, ...updates } : block,
      );
      onChange(updatedBlocks);
    },
    [value, onChange],
  );

  // Delete block
  const deleteBlock = useCallback(
    (id: string) => {
      const updatedBlocks = value.filter((block) => block.id !== id);
      onChange(updatedBlocks);
    },
    [value, onChange],
  );

  // Move block up/down
  const moveBlock = useCallback(
    (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= value.length) return;

      const newBlocks = [...value];
      [newBlocks[index], newBlocks[newIndex]] = [
        newBlocks[newIndex],
        newBlocks[index],
      ];
      onChange(newBlocks);
    },
    [value, onChange],
  );

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      // TODO: Implement actual image upload to your storage service
      // For now, create object URL for demo
      const objectUrl = URL.createObjectURL(file);
      addImageBlock(objectUrl, file.name);
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newBlocks = [...value];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);

    onChange(newBlocks);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Content Blocks */}
      <div className="space-y-4">
        {value.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <div className="space-y-4">
              <Type className="h-8 w-8 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Start Creating Content</h3>
                <p className="text-muted-foreground">{placeholder}</p>
              </div>
              <div className="flex justify-center space-x-2">
                <Button onClick={addTextBlock} variant="outline" size="sm">
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Dialog
                  open={imageDialogOpen}
                  onOpenChange={setImageDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Image className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Alt Text (Optional)</Label>
                        <Input
                          value={imageAlt}
                          onChange={(e) => setImageAlt(e.target.value)}
                          placeholder="Describe the image..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Upload Image</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            className="hidden"
                            id="image-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("image-upload")?.click()
                            }
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => addImageBlock(imageUrl, imageAlt)}
                          disabled={!imageUrl}
                          className="flex-1"
                        >
                          Add Image
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImageDialogOpen(false);
                            setImageUrl("");
                            setImageAlt("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        {value.map((block, index) => (
          <Card
            key={block.id}
            className="group relative"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            {/* Block Controls */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveBlock(index, "up")}
                disabled={index === 0}
                className="h-7 w-7 p-0"
              >
                <MoveUp className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveBlock(index, "down")}
                disabled={index === value.length - 1}
                className="h-7 w-7 p-0"
              >
                <MoveDown className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteBlock(block.id)}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <CardContent className="p-4">
              {block.type === "text" ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      Text Block
                    </Badge>
                  </div>
                  <Textarea
                    value={block.content}
                    onChange={(e) =>
                      updateBlock(block.id, { content: e.target.value })
                    }
                    placeholder="Write your content... (Markdown supported)"
                    rows={6}
                    className="min-h-[120px] resize-y"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      Image Block
                    </Badge>
                  </div>

                  {/* Image Preview */}
                  {block.imageUrl && (
                    <div
                      className={`flex ${
                        block.imageAlignment === "left"
                          ? "justify-start"
                          : block.imageAlignment === "right"
                            ? "justify-end"
                            : "justify-center"
                      }`}
                    >
                      <img
                        src={block.imageUrl}
                        alt={block.imageAlt || "Content image"}
                        className={`rounded-lg border ${
                          block.imageSize === "small"
                            ? "max-w-32 sm:max-w-48"
                            : block.imageSize === "medium"
                              ? "max-w-48 sm:max-w-64"
                              : block.imageSize === "large"
                                ? "max-w-64 sm:max-w-96"
                                : "w-full"
                        } h-auto`}
                      />
                    </div>
                  )}

                  {/* Image Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Image URL</Label>
                      <Input
                        value={block.imageUrl || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { imageUrl: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Alt Text</Label>
                      <Input
                        value={block.imageAlt || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { imageAlt: e.target.value })
                        }
                        placeholder="Describe the image..."
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Alignment</Label>
                      <Select
                        value={block.imageAlignment || "center"}
                        onValueChange={(value: "left" | "center" | "right") =>
                          updateBlock(block.id, { imageAlignment: value })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">
                            <div className="flex items-center space-x-2">
                              <AlignLeft className="h-3 w-3" />
                              <span>Left</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="center">
                            <div className="flex items-center space-x-2">
                              <AlignCenter className="h-3 w-3" />
                              <span>Center</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="right">
                            <div className="flex items-center space-x-2">
                              <AlignRight className="h-3 w-3" />
                              <span>Right</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Size</Label>
                      <Select
                        value={block.imageSize || "medium"}
                        onValueChange={(
                          value: "small" | "medium" | "large" | "full",
                        ) => updateBlock(block.id, { imageSize: value })}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="full">Full Width</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Block Buttons */}
      {value.length > 0 && (
        <div className="flex justify-center space-x-2 pt-4">
          <Button onClick={addTextBlock} variant="outline" size="sm">
            <Type className="h-4 w-4 mr-2" />
            Add Text
          </Button>
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Image className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>Add Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alt Text (Optional)</Label>
                  <Input
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Describe the image..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Upload Image</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="image-upload-dialog"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("image-upload-dialog")?.click()
                      }
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => addImageBlock(imageUrl, imageAlt)}
                    disabled={!imageUrl}
                    className="flex-1"
                  >
                    Add Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImageDialogOpen(false);
                      setImageUrl("");
                      setImageAlt("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
