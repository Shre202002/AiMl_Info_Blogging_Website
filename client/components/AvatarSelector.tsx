import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, User, Palette, Sparkles, Upload } from "lucide-react";

interface AvatarOption {
  id: string;
  url: string;
  category: "abstract" | "animals" | "characters" | "minimal";
  name: string;
  premium?: boolean;
}

interface AvatarSelectorProps {
  currentAvatar?: string;
  userName: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export function AvatarSelector({
  currentAvatar,
  userName,
  onAvatarChange,
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  // Pre-defined avatar options
  const avatarOptions: AvatarOption[] = [
    // Abstract
    {
      id: "abstract-1",
      url: "https://api.dicebear.com/7.x/shapes/svg?seed=abstract1&backgroundColor=3b82f6",
      category: "abstract",
      name: "Blue Geometric",
    },
    {
      id: "abstract-2",
      url: "https://api.dicebear.com/7.x/shapes/svg?seed=abstract2&backgroundColor=ef4444",
      category: "abstract",
      name: "Red Pattern",
    },
    {
      id: "abstract-3",
      url: "https://api.dicebear.com/7.x/shapes/svg?seed=abstract3&backgroundColor=10b981",
      category: "abstract",
      name: "Green Flow",
    },
    {
      id: "abstract-4",
      url: "https://api.dicebear.com/7.x/shapes/svg?seed=abstract4&backgroundColor=f59e0b",
      category: "abstract",
      name: "Orange Waves",
    },

    // Animals
    {
      id: "animal-1",
      url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userName}cat`,
      category: "animals",
      name: "Robot Cat",
    },
    {
      id: "animal-2",
      url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userName}dog`,
      category: "animals",
      name: "Robot Dog",
    },
    {
      id: "animal-3",
      url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userName}bird`,
      category: "animals",
      name: "Robot Bird",
    },

    // Characters
    {
      id: "char-1",
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}1`,
      category: "characters",
      name: "Friendly Avatar",
    },
    {
      id: "char-2",
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}2`,
      category: "characters",
      name: "Professional",
    },
    {
      id: "char-3",
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}3`,
      category: "characters",
      name: "Casual Style",
    },
    {
      id: "char-4",
      url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userName}`,
      category: "characters",
      name: "Adventurer",
      premium: true,
    },

    // Minimal
    {
      id: "minimal-1",
      url: `https://api.dicebear.com/7.x/initials/svg?seed=${userName}&backgroundColor=6366f1`,
      category: "minimal",
      name: "Initials Blue",
    },
    {
      id: "minimal-2",
      url: `https://api.dicebear.com/7.x/initials/svg?seed=${userName}&backgroundColor=8b5cf6`,
      category: "minimal",
      name: "Initials Purple",
    },
    {
      id: "minimal-3",
      url: `https://api.dicebear.com/7.x/identicon/svg?seed=${userName}`,
      category: "minimal",
      name: "Identicon",
    },
  ];

  const categories = [
    { id: "all", name: "All", icon: Palette },
    { id: "characters", name: "Characters", icon: User },
    { id: "abstract", name: "Abstract", icon: Sparkles },
    { id: "animals", name: "Animals", icon: Camera },
    { id: "minimal", name: "Minimal", icon: User },
  ];

  const filteredAvatars = avatarOptions.filter(
    (avatar) =>
      selectedCategory === "all" || avatar.category === selectedCategory,
  );

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  /**
   * AVATAR SAVE HANDLER - Real-time Header Update
   *
   * This function saves the selected avatar and immediately updates the header
   * profile picture through the authentication context.
   *
   * PROCESS:
   * 1. Validate selected avatar exists
   * 2. Save to backend API (TODO: implement)
   * 3. Update auth context for immediate UI changes
   * 4. Call parent callback for additional handling
   * 5. Show success notification
   *
   * REAL-TIME UPDATE FLOW:
   * AvatarSelector -> AuthContext -> Header Component
   * This ensures the header profile picture updates instantly without page reload.
   */
  const { updateUserAvatar } = useAuth();

  const handleSave = async () => {
    if (!selectedAvatar) return;

    try {
      // TODO: Replace with actual API call to save avatar
      /*
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl: selectedAvatar })
      });

      if (!response.ok) {
        throw new Error('Failed to save avatar');
      }

      const result = await response.json();
      */

      // Update authentication context for immediate header update
      // This is the key to real-time avatar changes in the header
      updateUserAvatar(selectedAvatar);

      // Call parent callback for any additional handling
      onAvatarChange(selectedAvatar);

      toast({
        title: "Avatar updated!",
        description:
          "Your profile picture has been changed successfully and is now visible in the header.",
      });
    } catch (error) {
      console.error("Avatar save error:", error);
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCustomUrl = () => {
    if (!customUrl.trim()) return;

    try {
      new URL(customUrl); // Validate URL
      setSelectedAvatar(customUrl);
      setCustomUrl("");
      toast({
        title: "Custom avatar added",
        description: "Don't forget to save your changes!",
      });
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Upload to your file storage service
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await fetch('/api/upload/avatar', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`,
      //   },
      //   body: formData
      // });
      // const { url } = await response.json();

      // For demo: create object URL
      const objectUrl = URL.createObjectURL(file);
      setSelectedAvatar(objectUrl);

      toast({
        title: "Image uploaded",
        description: "Don't forget to save your changes!",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
          Choose Your Avatar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Current Avatar Preview - Mobile First */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
            <AvatarImage src={selectedAvatar} alt="Selected avatar" />
            <AvatarFallback className="text-sm sm:text-base">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm sm:text-base">
              Current Selection
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              This will be your new profile picture
            </p>
          </div>
        </div>

        {/* Category Filters - Mobile First */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.charAt(0)}</span>
              </Button>
            );
          })}
        </div>

        {/* Avatar Grid - Mobile First */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {filteredAvatars.map((avatar) => (
            <div key={avatar.id} className="relative">
              <button
                onClick={() => handleAvatarSelect(avatar.url)}
                className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                  selectedAvatar === avatar.url
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={avatar.url} alt={avatar.name} />
                  <AvatarFallback className="text-xs">
                    {avatar.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </button>
              {avatar.premium && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 text-xs px-1"
                >
                  <Sparkles className="h-2 w-2" />
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Custom Options - Mobile First */}
        <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
          <h4 className="font-medium text-sm">Custom Avatar</h4>

          {/* URL Input - Mobile First */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Enter image URL..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 h-10 text-sm"
            />
            <Button
              onClick={handleCustomUrl}
              variant="outline"
              disabled={!customUrl.trim()}
              className="h-10 px-4 text-sm"
            >
              Add
            </Button>
          </div>

          {/* File Upload - Mobile First */}
          <div>
            <Label htmlFor="avatar-upload" className="sr-only">
              Upload avatar
            </Label>
            <Button
              variant="outline"
              className="w-full h-10 text-sm"
              disabled={isUploading}
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        </div>

        {/* Save Button - Mobile First */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
          <Button
            onClick={handleSave}
            disabled={!selectedAvatar || selectedAvatar === currentAvatar}
            className="flex-1 h-10 text-sm"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedAvatar(currentAvatar)}
            className="h-10 px-4 text-sm"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
