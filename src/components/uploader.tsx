"use client";

import { useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { ourFileRouter } from "@/lib/uploadthing";

// Generate the upload helpers
const { useUploadThing } = generateReactHelpers<typeof ourFileRouter>();

interface UploaderProps {
  onUploadComplete?: (url: string, type: string) => void;
  onUploadError?: (error: string) => void;
  accept?: "image" | "video" | "document" | "multiple-images";
  maxFiles?: number;
  className?: string;
}

export function Uploader({
  onUploadComplete,
  onUploadError,
  accept = "image",
  maxFiles = 1,
  className,
}: UploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      url: string;
      name: string;
      type: string;
    }>
  >([]);

  const { startUpload, isUploading } = useUploadThing(
    accept === "image"
      ? "imageUploader"
      : accept === "video"
        ? "videoUploader"
        : accept === "document"
          ? "documentUploader"
          : "multipleImagesUploader",
    {
      onClientUploadComplete: (res) => {
        if (res) {
          const files = res.map((file) => ({
            url: file.url,
            name: file.name,
            type: file.type,
          }));
          setUploadedFiles(files);
          onUploadComplete?.(files[0]?.url || "", files[0]?.type || "");
        }
      },
      onUploadError: (error: Error) => {
        onUploadError?.(error.message);
      },
    },
  );

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      startUpload(fileArray);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getAcceptTypes = () => {
    switch (accept) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "document":
        return "application/pdf";
      case "multiple-images":
        return "image/*";
      default:
        return "image/*";
    }
  };

  const getIcon = () => {
    switch (accept) {
      case "image":
      case "multiple-images":
        return <ImageIcon className="h-8 w-8" />;
      case "video":
        return <Video className="h-8 w-8" />;
      case "document":
        return <FileText className="h-8 w-8" />;
      default:
        return <Upload className="h-8 w-8" />;
    }
  };

  const getLabel = () => {
    switch (accept) {
      case "image":
        return "Upload Image";
      case "video":
        return "Upload Video";
      case "document":
        return "Upload Document";
      case "multiple-images":
        return "Upload Images";
      default:
        return "Upload File";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {getIcon()}
            <div className="text-center">
              <h3 className="text-lg font-semibold">{getLabel()}</h3>
              <p className="text-sm text-muted-foreground">
                {accept === "multiple-images"
                  ? `Upload up to ${maxFiles} images`
                  : "Click to select or drag and drop"}
              </p>
            </div>
            <input
              type="file"
              accept={getAcceptTypes()}
              multiple={accept === "multiple-images"}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <Button asChild variant="outline" disabled={isUploading} className="ripple-effect">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Choose Files"}
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Status */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-center text-sm">
            <span>Uploading...</span>
          </div>
          <Progress value={50} className="w-full" />
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files:</h4>
          <div className="grid gap-2">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    ) : file.type.startsWith("video/") ? (
                      <Video className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{file.url}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
