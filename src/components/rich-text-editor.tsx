"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/media-picker";
import { MediaType } from "@prisma/client";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Hash,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Table as TableIcon,
  TableProperties,
  Columns,
  Rows,
  Plus,
  Minus,
  Trash2,
  Upload,
  FolderOpen,
  FileText,
} from "lucide-react";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Start writing your article...",
  className = "",
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [imageSeoTitle, setImageSeoTitle] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [mediaAlignment, setMediaAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [mediaSize, setMediaSize] = useState<'small' | 'medium' | 'large' | 'full'>('full');
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Create lowlight instance for code highlighting
  const lowlight = createLowlight(common);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Disable built-in extensions we want to configure separately
        link: false,
        underline: false,
        codeBlock: false, // Disable default code block to use CodeBlockLowlight
      }),
      TextStyle,
      Image.configure({
        HTMLAttributes: {
          class: "w-full h-auto rounded-lg my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary hover:underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border bg-muted font-bold p-2",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border p-2",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-muted p-4 rounded-lg my-4 overflow-x-auto",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
        style: "color: inherit;",
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when the content prop changes (important for edit mode)
  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const getMediaClasses = () => {
    const sizeClasses = {
      small: 'w-1/4',
      medium: 'w-1/2', 
      large: 'w-3/4',
      full: 'w-full'
    };
    
    const alignClasses = {
      left: 'float-left mr-4',
      center: 'mx-auto block',
      right: 'float-right ml-4'
    };
    
    return `${sizeClasses[mediaSize]} ${alignClasses[mediaAlignment]} h-auto rounded-lg my-4`;
  };

  const handleMediaSelect = (media: any) => {
    setSelectedMedia(media);
    setShowMediaPicker(false);
    setShowMediaOptions(true);
  };

  const insertSelectedMedia = () => {
    if (!selectedMedia) return;
    
    const mediaClasses = getMediaClasses();
    
    if (selectedMedia.type === MediaType.IMAGE) {
      // Insert image with custom HTML to include classes
      const imageHtml = `<img src="${selectedMedia.url}" alt="${selectedMedia.altText || selectedMedia.seoTitle || 'Image'}" title="${selectedMedia.seoTitle || selectedMedia.altText || ''}" class="${mediaClasses}" />`;
      editor.chain().focus().insertContent(imageHtml).run();
    } else if (selectedMedia.type === MediaType.VIDEO) {
      // Insert video as HTML
      const videoHtml = `<video controls class="${mediaClasses}" title="${selectedMedia.seoTitle || selectedMedia.altText || 'Video'}">
        <source src="${selectedMedia.url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>`;
      editor.chain().focus().insertContent(videoHtml).run();
    } else if (selectedMedia.type === MediaType.DOCUMENT) {
      // Insert document as a link
      const linkText = selectedMedia.altText || selectedMedia.seoTitle || 'Download Document';
      editor.chain().focus().insertContent(`<a href="${selectedMedia.url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${linkText}</a>`).run();
    }
    
    setShowMediaOptions(false);
    setSelectedMedia(null);
    setMediaAlignment('center');
    setMediaSize('full');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // For now, we'll open the media picker to handle file uploads
      // In a more advanced implementation, we could handle the upload directly
      setShowMediaPicker(true);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ 
        src: imageUrl,
        alt: imageAltText || undefined,
        title: imageSeoTitle || undefined,
      }).run();
      setImageUrl("");
      setImageAltText("");
      setImageSeoTitle("");
      setShowImageDialog(false);
    }
  };

  const handleParseHTML = () => {
    const { from, to } = editor.state.selection;
    
    if (from === to) {
      alert('Please select the HTML code you want to convert to formatted content.');
      return;
    }
    
    const selectedText = editor.state.doc.textBetween(from, to, '');
    
    if (!selectedText.trim()) {
      alert('No text selected.');
      return;
    }
    
    // Delete the selected raw HTML and insert it as actual HTML content
    editor.chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent(selectedText)
      .run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true })
      .run();
    setShowTableDialog(false);
    setTableRows(3);
    setTableCols(3);
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-10 w-10 p-0 sm:h-8 sm:w-8 touch-manipulation"
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-1 sm:gap-1 gap-y-2">
            {/* Text Formatting */}
            <div className="flex gap-1 border-r border-border pr-1 mr-1 sm:pr-2 sm:mr-2">
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleBold().run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleBold()
                      .run();
                  }
                }}
                isActive={editor.isActive("bold")}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleItalic().run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleItalic()
                      .run();
                  }
                }}
                isActive={editor.isActive("italic")}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleUnderline().run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleUnderline()
                      .run();
                  }
                }}
                isActive={editor.isActive("underline")}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleStrike().run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleStrike()
                      .run();
                  }
                }}
                isActive={editor.isActive("strike")}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </ToolbarButton>
              {/* Code button removed - use HTML parser instead */}
            </div>

            {/* Headings */}
            <div className="flex gap-1 border-r border-border pr-1 mr-1 sm:pr-2 sm:mr-2">
              <ToolbarButton
                onClick={() => {
                  const { from, to, empty } = editor.state.selection;
                  if (empty) {
                    // No selection, just toggle at cursor position
                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                  } else {
                    // Has selection, preserve it and apply formatting
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        // Preserve the current selection
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleHeading({ level: 1 })
                      .run();
                  }
                }}
                isActive={editor.isActive("heading", { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { from, to, empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleHeading({ level: 2 })
                      .run();
                  }
                }}
                isActive={editor.isActive("heading", { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { from, to, empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleHeading({ level: 3 }).run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleHeading({ level: 3 })
                      .run();
                  }
                }}
                isActive={editor.isActive("heading", { level: 3 })}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="flex gap-1 border-r border-border pr-1 mr-1 sm:pr-2 sm:mr-2">
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleBulletList().run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleBulletList()
                      .run();
                  }
                }}
                isActive={editor.isActive("bulletList")}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleOrderedList().run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleOrderedList()
                      .run();
                  }
                }}
                isActive={editor.isActive("orderedList")}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleBlockquote().run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleBlockquote()
                      .run();
                  }
                }}
                isActive={editor.isActive("blockquote")}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Alignment */}
            <div className="flex gap-1 border-r border-border pr-1 mr-1 sm:pr-2 sm:mr-2">
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().setTextAlign("left").run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .setTextAlign("left")
                      .run();
                  }
                }}
                isActive={editor.isActive({ textAlign: "left" })}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().setTextAlign("center").run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .setTextAlign("center")
                      .run();
                  }
                }}
                isActive={editor.isActive({ textAlign: "center" })}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().setTextAlign("right").run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .setTextAlign("right")
                      .run();
                  }
                }}
                isActive={editor.isActive({ textAlign: "right" })}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().setTextAlign("justify").run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .setTextAlign("justify")
                      .run();
                  }
                }}
                isActive={editor.isActive({ textAlign: "justify" })}
                title="Justify"
              >
                <AlignJustify className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Links and Media */}
            <div className="flex gap-1 border-r border-border pr-1 mr-1 sm:pr-2 sm:mr-2">
              <ToolbarButton
                onClick={() => setShowLinkDialog(true)}
                isActive={editor.isActive("link")}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={removeLink}
                disabled={!editor.isActive("link")}
                title="Remove Link"
              >
                <Unlink className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => setShowImageDialog(true)} title="Add Image URL">
                <ImageIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => setShowMediaPicker(true)} title="Insert Media from Library">
                <FolderOpen className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Table Operations */}
            <div className="flex gap-1 border-r border-border pr-1 mr-1 sm:pr-2 sm:mr-2">
              <ToolbarButton
                onClick={() => setShowTableDialog(true)}
                isActive={editor.isActive("table")}
                title="Insert Table"
              >
                <TableIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                disabled={!editor.can().addColumnBefore()}
                title="Add Column Before"
              >
                <Plus className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteColumn().run()}
                disabled={!editor.can().deleteColumn()}
                title="Delete Column"
              >
                <Columns className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addRowBefore().run()}
                disabled={!editor.can().addRowBefore()}
                title="Add Row Before"
              >
                <Plus className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteRow().run()}
                disabled={!editor.can().deleteRow()}
                title="Delete Row"
              >
                <Rows className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteTable().run()}
                disabled={!editor.can().deleteTable()}
                title="Delete Table"
              >
                <Trash2 className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* HTML Parser */}
            <div className="flex gap-1 border-r border-border pr-1 mr-1 sm:pr-2 sm:mr-2">
              <ToolbarButton
                onClick={handleParseHTML}
                title="Parse HTML - Select raw HTML and click to convert it to formatted content"
              >
                <span className="text-xs font-bold">HTML</span>
              </ToolbarButton>
            </div>

            {/* Neon Highlights */}
            <div className="flex gap-1 border-r border-border pr-1 mr-1 sm:pr-2 sm:mr-2">
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleHighlight({ color: "rgba(0, 255, 255, 0.4)" }).run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleHighlight({ color: "rgba(0, 255, 255, 0.4)" })
                      .run();
                  }
                }}
                isActive={editor.isActive("highlight", { color: "rgba(0, 255, 255, 0.4)" })}
                title="Neon Cyan Highlight"
              >
                <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 animate-pulse border border-cyan-300"></div>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleHighlight({ color: "rgba(255, 255, 0, 0.4)" }).run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleHighlight({ color: "rgba(255, 255, 0, 0.4)" })
                      .run();
                  }
                }}
                isActive={editor.isActive("highlight", { color: "rgba(255, 255, 0, 0.4)" })}
                title="Neon Yellow Highlight"
              >
                <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/80 animate-pulse border border-yellow-300"></div>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleHighlight({ color: "rgba(255, 0, 255, 0.4)" }).run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleHighlight({ color: "rgba(255, 0, 255, 0.4)" })
                      .run();
                  }
                }}
                isActive={editor.isActive("highlight", { color: "rgba(255, 0, 255, 0.4)" })}
                title="Neon Magenta Highlight"
              >
                <div className="w-4 h-4 rounded-full bg-fuchsia-400 shadow-lg shadow-fuchsia-400/80 animate-pulse border border-fuchsia-300"></div>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const { empty } = editor.state.selection;
                  if (empty) {
                    editor.chain().focus().toggleHighlight({ color: "rgba(0, 255, 0, 0.4)" }).run();
                  } else {
                    editor.chain()
                      .focus()
                      .command(({ tr, state }) => {
                        tr.setSelection(state.selection);
                        return true;
                      })
                      .toggleHighlight({ color: "rgba(0, 255, 0, 0.4)" })
                      .run();
                  }
                }}
                isActive={editor.isActive("highlight", { color: "rgba(0, 255, 0, 0.4)" })}
                title="Neon Green Highlight"
              >
                <div className="w-4 h-4 rounded-full bg-lime-400 shadow-lg shadow-lime-400/80 animate-pulse border border-lime-300"></div>
              </ToolbarButton>
            </div>

            {/* History */}
            <div className="flex gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div 
            className="rich-text-editor"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <EditorContent editor={editor} />
          </div>
        </CardContent>
      </Card>

      {/* Custom Styles */}
      <style jsx>{`
        .rich-text-editor :global(.ProseMirror) {
          outline: none;
          padding: 1rem;
          min-height: 400px;
          color: inherit;
        }
        
        .rich-text-editor :global(.ProseMirror h1) {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          line-height: 1.2;
          color: inherit !important;
        }
        
        .rich-text-editor :global(.ProseMirror h2) {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.75rem 0;
          line-height: 1.3;
          color: inherit !important;
        }
        
        .rich-text-editor :global(.ProseMirror h3) {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0.5rem 0;
          line-height: 1.4;
          color: inherit !important;
        }
        
        .rich-text-editor :global(.ProseMirror p) {
          margin: 0.5rem 0;
          line-height: 1.6;
          color: inherit;
        }
        
        .rich-text-editor :global(.ProseMirror ul),
        .rich-text-editor :global(.ProseMirror ol) {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        .rich-text-editor :global(.ProseMirror blockquote) {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
        
        .rich-text-editor :global(.ProseMirror code) {
          background: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        
        .rich-text-editor :global(.ProseMirror a) {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        .rich-text-editor :global(.ProseMirror img) {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .rich-text-editor :global(.ProseMirror table) {
          border-collapse: collapse;
          table-layout: auto;
          width: 100%;
          margin: 1rem 0;
          overflow: hidden;
          background-color: rgba(10, 56, 92, 0.4);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 0.5rem;
        }
        
        .rich-text-editor :global(.ProseMirror table td),
        .rich-text-editor :global(.ProseMirror table th) {
          border: 1px solid rgba(100, 200, 255, 0.3);
          padding: 0.75rem 1rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
          min-width: 100px;
        }
        
        .rich-text-editor :global(.ProseMirror table th) {
          background: linear-gradient(135deg, 
            rgba(0, 255, 255, 0.2) 0%, 
            rgba(0, 100, 150, 0.2) 100%);
          border: 2px solid rgba(0, 255, 255, 0.4);
          font-weight: 700;
          text-align: left;
          color: hsl(var(--primary));
          text-shadow: 0 0 10px hsl(var(--primary) / 0.5);
        }
        
        .rich-text-editor :global(.ProseMirror table td) {
          background-color: rgba(10, 25, 47, 0.3);
          color: rgba(248, 250, 252, 0.9);
        }
        
        .rich-text-editor :global(.ProseMirror table .selectedCell) {
          background-color: rgba(0, 255, 255, 0.15);
        }
        
        .rich-text-editor :global(.ProseMirror pre) {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          font-family: 'JetBrainsMono', 'Courier New', Courier, monospace;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
        
        .rich-text-editor :global(.ProseMirror pre code) {
          background: none;
          padding: 0;
          font-size: 0.9rem;
          color: inherit;
        }
        
        .rich-text-editor :global(.ProseMirror .hljs-comment),
        .rich-text-editor :global(.ProseMirror .hljs-quote) {
          color: #6a737d;
        }
        
        .rich-text-editor :global(.ProseMirror .hljs-keyword),
        .rich-text-editor :global(.ProseMirror .hljs-selector-tag),
        .rich-text-editor :global(.ProseMirror .hljs-subst) {
          color: #d73a49;
        }
        
        .rich-text-editor :global(.ProseMirror .hljs-number),
        .rich-text-editor :global(.ProseMirror .hljs-literal),
        .rich-text-editor :global(.ProseMirror .hljs-variable),
        .rich-text-editor :global(.ProseMirror .hljs-template-variable),
        .rich-text-editor :global(.ProseMirror .hljs-tag .hljs-attr) {
          color: #005cc5;
        }
        
        .rich-text-editor :global(.ProseMirror .hljs-string),
        .rich-text-editor :global(.ProseMirror .hljs-doctag) {
          color: #032f62;
        }
        
        .rich-text-editor :global(.ProseMirror .hljs-title),
        .rich-text-editor :global(.ProseMirror .hljs-section),
        .rich-text-editor :global(.ProseMirror .hljs-selector-id) {
          color: #6f42c1;
          font-weight: bold;
        }
      `}</style>

      {/* Link Dialog */}
      {showLinkDialog && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Add Link</h3>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={addLink} disabled={!linkUrl}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Add Image</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="imageAltText">Alt Text (Optional)</Label>
                  <input
                    id="imageAltText"
                    type="text"
                    placeholder="Describe the image for accessibility"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="imageSeoTitle">SEO Title (Optional)</Label>
                  <input
                    id="imageSeoTitle"
                    type="text"
                    placeholder="SEO-friendly image title"
                    value={imageSeoTitle}
                    onChange={(e) => setImageSeoTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button onClick={addImage} disabled={!imageUrl}>
                    Add Image
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowImageDialog(false);
                    setImageUrl("");
                    setImageAltText("");
                    setImageSeoTitle("");
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Picker Dialog */}
      <MediaPicker
        onSelect={handleMediaSelect}
        allowedTypes={[MediaType.IMAGE, MediaType.VIDEO, MediaType.DOCUMENT]}
        maxSelection={1}
        showUpload={true}
        triggerText="Select Media"
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
      />

      {/* Media Options Dialog */}
      {showMediaOptions && selectedMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-w-[90vw]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Media Options</h3>
                
                {/* Media Preview */}
                <div className="border border-border rounded-lg p-4 bg-muted/50">
                  {selectedMedia.type === MediaType.IMAGE && (
                    <img 
                      src={selectedMedia.url} 
                      alt={selectedMedia.altText || 'Preview'} 
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  {selectedMedia.type === MediaType.VIDEO && (
                    <video 
                      src={selectedMedia.url} 
                      className="w-full h-32 object-cover rounded"
                      muted
                    />
                  )}
                  {selectedMedia.type === MediaType.DOCUMENT && (
                    <div className="flex items-center justify-center h-32 bg-background rounded">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {selectedMedia.altText || 'Document'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Size Options */}
                {selectedMedia.type !== MediaType.DOCUMENT && (
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large', 'full'] as const).map((size) => (
                        <Button
                          key={size}
                          variant={mediaSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMediaSize(size)}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alignment Options */}
                {selectedMedia.type !== MediaType.DOCUMENT && (
                  <div className="space-y-2">
                    <Label>Alignment</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={mediaAlignment === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMediaAlignment('left')}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={mediaAlignment === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMediaAlignment('center')}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={mediaAlignment === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMediaAlignment('right')}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  <Button onClick={insertSelectedMedia}>
                    Insert Media
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowMediaOptions(false);
                      setSelectedMedia(null);
                      setMediaAlignment('center');
                      setMediaSize('full');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Insert Table</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Rows:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Columns:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={insertTable}>
                  Insert
                </Button>
                <Button variant="outline" onClick={() => setShowTableDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
