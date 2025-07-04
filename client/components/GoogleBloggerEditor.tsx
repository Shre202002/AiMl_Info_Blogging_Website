import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link2,
  Image,
  Video,
  Table,
  Code,
  Quote,
  Undo,
  Redo,
  Type,
  Palette,
  Indent,
  Outdent,
  FileText,
  Eye,
  Upload,
  Search,
  MoreHorizontal,
  Save,
  Download,
} from "lucide-react";

interface GoogleBloggerEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function GoogleBloggerEditor({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
  className = "",
}: GoogleBloggerEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorMode, setEditorMode] = useState<"wysiwyg" | "html" | "preview">(
    "wysiwyg",
  );
  const [htmlContent, setHtmlContent] = useState(value);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoSave, setAutoSave] = useState(true);

  // Font families similar to Google Blogger
  const fontFamilies = [
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Helvetica", value: "Helvetica, sans-serif" },
    { name: "Times New Roman", value: "Times New Roman, serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
    { name: "Courier New", value: "Courier New, monospace" },
    { name: "Impact", value: "Impact, fantasy" },
    { name: "Comic Sans MS", value: "Comic Sans MS, cursive" },
  ];

  // Font sizes
  const fontSizes = [
    { name: "Small", value: "12px" },
    { name: "Normal", value: "14px" },
    { name: "Medium", value: "18px" },
    { name: "Large", value: "24px" },
    { name: "Extra Large", value: "32px" },
    { name: "Huge", value: "48px" },
  ];

  // Text colors
  const textColors = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#B7B7B7",
    "#CCCCCC",
    "#D9D9D9",
    "#EFEFEF",
    "#F3F3F3",
    "#FFFFFF",
    "#980000",
    "#FF0000",
    "#FF9900",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#4A86E8",
    "#0000FF",
    "#9900FF",
    "#FF00FF",
    "#E6B8AF",
    "#F4CCCC",
    "#FCE5CD",
    "#FFF2CC",
    "#D9EAD3",
    "#D0E0E3",
    "#C9DAF8",
    "#CFE2F3",
    "#D9D2E9",
    "#EAD1DC",
    "#DD7E6B",
    "#EA9999",
    "#F9CB9C",
    "#FFE599",
    "#B6D7A8",
    "#A2C4C9",
    "#A4C2F4",
    "#9FC5E8",
    "#B4A7D6",
    "#D5A6BD",
    "#CC4125",
    "#E06666",
    "#F6B26B",
    "#FFD966",
    "#93C47D",
    "#76A5AF",
    "#6D9EEB",
    "#6FA8DC",
    "#8E7CC3",
    "#C27BA0",
    "#A61C00",
    "#CC0000",
    "#E69138",
    "#F1C232",
    "#6AA84F",
    "#45818E",
    "#3C78D8",
    "#3D85C6",
    "#674EA7",
    "#A64D79",
    "#85200C",
    "#990000",
    "#B45F06",
    "#BF9000",
    "#38761D",
    "#134F5C",
    "#1155CC",
    "#0B5394",
    "#351C75",
    "#733554",
    "#5B0F00",
    "#660000",
    "#783F04",
    "#7F6000",
    "#274E13",
    "#0C343D",
    "#1C4587",
    "#073763",
    "#20124D",
    "#4C1130",
  ];

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorMode === "wysiwyg") {
      editorRef.current.innerHTML = value;
      // Force LTR direction and alignment
      editorRef.current.style.direction = "ltr";
      editorRef.current.style.textAlign = "left";
      editorRef.current.style.unicodeBidi = "embed";

      // Set default paragraph separator
      document.execCommand("defaultParagraphSeparator", false, "p");
    }
  }, [value, editorMode]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;

    const timer = setTimeout(() => {
      if (editorRef.current && editorMode === "wysiwyg") {
        const content = editorRef.current.innerHTML;
        if (content !== value) {
          onChange(content);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [htmlContent, autoSave, onChange, value, editorMode]);

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (editorRef.current && editorMode === "wysiwyg") {
      const content = editorRef.current.innerHTML;
      setHtmlContent(content);
      onChange(content);

      // Ensure editor maintains LTR direction after content changes
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.style.direction = "ltr";
          editorRef.current.style.textAlign = "left";
          editorRef.current.style.unicodeBidi = "embed";
        }
      }, 0);
    }
  }, [onChange, editorMode]);

  // Format command execution
  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      handleContentChange();
      editorRef.current?.focus();
    },
    [handleContentChange],
  );

  // Check if command is active
  const isCommandActive = useCallback((command: string) => {
    return document.queryCommandState(command);
  }, []);

  // Insert HTML content
  const insertHtml = useCallback(
    (html: string) => {
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const div = document.createElement("div");
          div.innerHTML = html;
          const fragment = document.createDocumentFragment();
          while (div.firstChild) {
            fragment.appendChild(div.firstChild);
          }
          range.insertNode(fragment);
          handleContentChange();
        }
      }
    },
    [handleContentChange],
  );

  // Insert link
  const insertLink = useCallback(() => {
    if (linkUrl && linkText) {
      const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      insertHtml(html);
      setLinkDialogOpen(false);
      setLinkUrl("");
      setLinkText("");
    }
  }, [linkUrl, linkText, insertHtml]);

  // Insert image
  const insertImage = useCallback(() => {
    if (imageUrl) {
      const html = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto; border-radius: 4px;" />`;
      insertHtml(html);
      setImageDialogOpen(false);
      setImageUrl("");
      setImageAlt("");
    }
  }, [imageUrl, imageAlt, insertHtml]);

  // Insert table
  const insertTable = useCallback(() => {
    let tableHtml =
      '<table style="border-collapse: collapse; width: 100%; margin: 16px 0;"><tbody>';
    for (let i = 0; i < tableRows; i++) {
      tableHtml += "<tr>";
      for (let j = 0; j < tableCols; j++) {
        tableHtml +=
          '<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Cell</td>';
      }
      tableHtml += "</tr>";
    }
    tableHtml += "</tbody></table>";
    insertHtml(tableHtml);
    setTableDialogOpen(false);
  }, [tableRows, tableCols, insertHtml]);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      // TODO: Implement actual image upload
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  // Find and replace
  const findAndReplace = useCallback(
    (find: string, replace: string) => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        const updatedContent = content.replace(new RegExp(find, "gi"), replace);
        editorRef.current.innerHTML = updatedContent;
        handleContentChange();
      }
    },
    [handleContentChange],
  );

  // Convert to markdown for preview
  const convertToMarkdown = useCallback((html: string) => {
    // Basic HTML to Markdown conversion
    return html
      .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
      .replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<em>(.*?)<\/em>/g, "*$1*")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/<h1>(.*?)<\/h1>/g, "# $1\n")
      .replace(/<h2>(.*?)<\/h2>/g, "## $1\n")
      .replace(/<h3>(.*?)<\/h3>/g, "### $1\n")
      .replace(/<h4>(.*?)<\/h4>/g, "#### $1\n")
      .replace(/<h5>(.*?)<\/h5>/g, "##### $1\n")
      .replace(/<h6>(.*?)<\/h6>/g, "###### $1\n")
      .replace(/<blockquote>(.*?)<\/blockquote>/g, "> $1\n")
      .replace(/<code>(.*?)<\/code>/g, "`$1`")
      .replace(/<pre><code>(.*?)<\/code><\/pre>/g, "```\n$1\n```")
      .replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
        return content.replace(/<li>(.*?)<\/li>/g, "- $1\n");
      })
      .replace(/<ol>(.*?)<\/ol>/gs, (match, content) => {
        let counter = 1;
        return content.replace(/<li>(.*?)<\/li>/g, () => `${counter++}. $1\n`);
      })
      .replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, "[$2]($1)")
      .replace(/<img.*?src="(.*?)".*?alt="(.*?)".*?\/?>/g, "![$2]($1)")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<\/p><p>/g, "\n\n")
      .replace(/<p>(.*?)<\/p>/g, "$1\n")
      .replace(/<[^>]*>/g, "");
  }, []);

  const toolbarButtonClass = "h-8 w-8 p-0 hover:bg-muted";
  const activeButtonClass = "h-8 w-8 p-0 bg-primary text-primary-foreground";

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-0">
        {/* Mode Tabs */}
        <Tabs
          value={editorMode}
          onValueChange={(value) => setEditorMode(value as any)}
        >
          <div className="flex items-center justify-between p-3 border-b">
            <TabsList className="h-8">
              <TabsTrigger value="wysiwyg" className="text-xs px-3 py-1">
                <Type className="h-3 w-3 mr-1" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="html" className="text-xs px-3 py-1">
                <FileText className="h-3 w-3 mr-1" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs px-3 py-1">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Badge
                variant={autoSave ? "default" : "secondary"}
                className="text-xs"
              >
                {autoSave ? "Auto-save ON" : "Auto-save OFF"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAutoSave(!autoSave)}
                className="h-7 px-2 text-xs"
              >
                <Save className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* WYSIWYG Editor */}
          <TabsContent value="wysiwyg" className="m-0">
            {/* Toolbar */}
            <div className="border-b bg-muted/30 p-2">
              <div className="flex flex-wrap items-center gap-1">
                {/* Font and Size */}
                <div className="flex items-center space-x-1">
                  <Select defaultValue="Arial, sans-serif">
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem
                          key={font.value}
                          value={font.value}
                          onClick={() => execCommand("fontName", font.value)}
                        >
                          <span style={{ fontFamily: font.value }}>
                            {font.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select defaultValue="14px">
                    <SelectTrigger className="h-8 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map((size) => (
                        <SelectItem
                          key={size.value}
                          value={size.value}
                          onClick={() => execCommand("fontSize", size.value)}
                        >
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Basic formatting */}
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("bold")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("bold")}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("italic")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("italic")}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("underline")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("underline")}
                    title="Underline (Ctrl+U)"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("strikeThrough")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("strikeThrough")}
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Text color */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={toolbarButtonClass}
                      title="Text Color"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="grid grid-cols-10 gap-1">
                      {textColors.map((color) => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => execCommand("foreColor", color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-6" />

                {/* Alignment & Text Direction */}
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("justifyLeft")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => {
                      execCommand("justifyLeft");
                      if (editorRef.current) {
                        editorRef.current.style.direction = "ltr";
                        editorRef.current.style.textAlign = "left";
                        editorRef.current.style.unicodeBidi = "embed";
                        // Apply to all child elements
                        const allElements =
                          editorRef.current.querySelectorAll("*");
                        allElements.forEach((el: any) => {
                          el.style.direction = "ltr";
                          el.style.textAlign = "left";
                          el.style.unicodeBidi = "embed";
                        });
                      }
                    }}
                    title="Align Left (L-to-R)"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("justifyCenter")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("justifyCenter")}
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("justifyRight")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("justifyRight")}
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("justifyFull")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("justifyFull")}
                    title="Justify"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Lists */}
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("insertUnorderedList")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("insertUnorderedList")}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      isCommandActive("insertOrderedList")
                        ? activeButtonClass
                        : toolbarButtonClass
                    }
                    onClick={() => execCommand("insertOrderedList")}
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={toolbarButtonClass}
                    onClick={() => execCommand("outdent")}
                    title="Decrease Indent"
                  >
                    <Outdent className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={toolbarButtonClass}
                    onClick={() => execCommand("indent")}
                    title="Increase Indent"
                  >
                    <Indent className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Insert elements */}
                <div className="flex items-center space-x-1">
                  <Dialog
                    open={linkDialogOpen}
                    onOpenChange={setLinkDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={toolbarButtonClass}
                        title="Insert Link"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle>Insert Link</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Link Text</Label>
                          <Input
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Link text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={insertLink}
                            disabled={!linkUrl || !linkText}
                            className="flex-1"
                          >
                            Insert Link
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setLinkDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={imageDialogOpen}
                    onOpenChange={setImageDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={toolbarButtonClass}
                        title="Insert Image"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
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
                          <Label>Alt Text</Label>
                          <Input
                            value={imageAlt}
                            onChange={(e) => setImageAlt(e.target.value)}
                            placeholder="Image description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Upload Image</Label>
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
                        <div className="flex space-x-2">
                          <Button
                            onClick={insertImage}
                            disabled={!imageUrl}
                            className="flex-1"
                          >
                            Insert Image
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setImageDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={tableDialogOpen}
                    onOpenChange={setTableDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={toolbarButtonClass}
                        title="Insert Table"
                      >
                        <Table className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle>Insert Table</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Rows</Label>
                            <Input
                              type="number"
                              value={tableRows}
                              onChange={(e) =>
                                setTableRows(
                                  Math.max(1, parseInt(e.target.value) || 1),
                                )
                              }
                              min="1"
                              max="20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Columns</Label>
                            <Input
                              type="number"
                              value={tableCols}
                              onChange={(e) =>
                                setTableCols(
                                  Math.max(1, parseInt(e.target.value) || 1),
                                )
                              }
                              min="1"
                              max="10"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={insertTable} className="flex-1">
                            Insert Table
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setTableDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Special formatting */}
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={toolbarButtonClass}
                    onClick={() => execCommand("formatBlock", "blockquote")}
                    title="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={toolbarButtonClass}
                    onClick={() => execCommand("formatBlock", "pre")}
                    title="Code Block"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Undo/Redo */}
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={toolbarButtonClass}
                    onClick={() => execCommand("undo")}
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={toolbarButtonClass}
                    onClick={() => execCommand("redo")}
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Additional tools */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={toolbarButtonClass}
                      title="More Tools"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <Input
                          placeholder="Find in document..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => execCommand("removeFormat")}
                        className="w-full justify-start"
                      >
                        Clear Formatting
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => execCommand("selectAll")}
                        className="w-full justify-start"
                      >
                        Select All
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Editor Area */}
            <div
              ref={editorRef}
              contentEditable
              className="wysiwyg-editor min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none"
              style={{
                lineHeight: "1.6",
                fontFamily: "Arial, sans-serif",
                fontSize: "14px",
                direction: "ltr",
                textAlign: "left",
                writingMode: "horizontal-tb",
                unicodeBidi: "embed",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
                textDirection: "ltr",
              }}
              dir="ltr"
              lang="en"
              onInput={handleContentChange}
              onFocus={() => {
                // Ensure proper direction when focused
                if (editorRef.current) {
                  editorRef.current.style.direction = "ltr";
                  editorRef.current.style.textAlign = "left";
                  document.execCommand("defaultParagraphSeparator", false, "p");
                }
              }}
              onKeyDown={(e) => {
                // Handle keyboard shortcuts
                if (e.ctrlKey || e.metaKey) {
                  switch (e.key) {
                    case "b":
                      e.preventDefault();
                      execCommand("bold");
                      break;
                    case "i":
                      e.preventDefault();
                      execCommand("italic");
                      break;
                    case "u":
                      e.preventDefault();
                      execCommand("underline");
                      break;
                    case "z":
                      if (e.shiftKey) {
                        e.preventDefault();
                        execCommand("redo");
                      } else {
                        e.preventDefault();
                        execCommand("undo");
                      }
                      break;
                    case "y":
                      e.preventDefault();
                      execCommand("redo");
                      break;
                  }
                }

                // Force LTR on Enter key
                if (e.key === "Enter") {
                  setTimeout(() => {
                    if (editorRef.current) {
                      const selection = window.getSelection();
                      if (selection && selection.focusNode) {
                        const element =
                          selection.focusNode.nodeType === Node.TEXT_NODE
                            ? selection.focusNode.parentElement
                            : (selection.focusNode as HTMLElement);
                        if (element && element.style) {
                          element.style.direction = "ltr";
                          element.style.textAlign = "left";
                        }
                      }
                    }
                  }, 0);
                }
              }}
              onPaste={(e) => {
                // Ensure pasted content maintains proper direction
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);

                // Force LTR after paste
                setTimeout(() => {
                  if (editorRef.current) {
                    editorRef.current.style.direction = "ltr";
                    editorRef.current.style.textAlign = "left";
                  }
                }, 0);
              }}
              data-placeholder={placeholder}
            />
          </TabsContent>

          {/* HTML Editor */}
          <TabsContent value="html" className="m-0">
            <div className="p-4">
              <textarea
                value={htmlContent}
                onChange={(e) => {
                  setHtmlContent(e.target.value);
                  onChange(e.target.value);
                }}
                className="w-full min-h-[400px] p-4 border rounded-md font-mono text-sm resize-y"
                placeholder="Enter HTML content..."
              />
            </div>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="m-0">
            <div className="p-4">
              <div className="prose prose-sm max-w-none border rounded-md p-4 min-h-[400px] bg-muted/20">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
