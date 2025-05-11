
import React, { useState, useRef, useEffect, useCallback } from "react";
import { paraphraseText } from "../services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TextEditor() {
  const [content, setContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    start: number;
    end: number;
    x: number;
    y: number;
  } | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setContent(target.innerText);
  };
  
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    
    if (
      selection &&
      selection.toString().trim() !== "" &&
      editorRef.current?.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const text = selection.toString();
      
      // Calculate selection indices relative to the editor content
      const editorText = editorRef.current.innerText;
      const selectionStart = editorText.indexOf(text);
      const selectionEnd = selectionStart + text.length;
      
      if (selectionStart >= 0) {
        setSelectionInfo({
          text,
          start: selectionStart,
          end: selectionEnd,
          x: rect.left + rect.width / 2,
          y: rect.bottom + window.scrollY + 10, // Position below the selection
        });
      }
    } else {
      setSelectionInfo(null);
    }
  }, []);

  const handleParaphraseClick = async () => {
    if (!selectionInfo) return;
    
    try {
      setIsProcessing(true);
      const paraphrasedText = await paraphraseText(selectionInfo.text);
      
      // Replace the selected text with the paraphrased version
      if (editorRef.current) {
        const beforeText = content.substring(0, selectionInfo.start);
        const afterText = content.substring(selectionInfo.end);
        const newContent = beforeText + paraphrasedText + afterText;
        
        editorRef.current.innerText = newContent;
        setContent(newContent);
        setSelectionInfo(null);
        
        toast.success("Text successfully paraphrased!");
      }
    } catch (error) {
      console.error("Paraphrase error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    
    // Click outside to dismiss popover
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        editorRef.current &&
        !editorRef.current.contains(e.target as Node)
      ) {
        setSelectionInfo(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleSelectionChange]);

  return (
    <div className="relative w-full">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-6 glass-card outline-none transition-all focus:ring-1 focus:ring-primary/50 shadow-lg animate-fade-in"
        suppressContentEditableWarning={true}
        data-placeholder="Start typing or paste your text here..."
      />
      
      {content.length === 0 && (
        <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
          Start typing or paste your text here...
        </div>
      )}
      
      {selectionInfo && (
        <div
          ref={popoverRef}
          className="absolute z-10 animate-slide-in shadow-lg"
          style={{
            left: `${selectionInfo.x}px`,
            top: `${selectionInfo.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleParaphraseClick}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all"
                  size="icon"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="h-5 w-5 rounded-full border-2 border-r-transparent animate-spin" />
                  ) : (
                    <span className="text-sm font-semibold">AI</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Paraphrase selected text</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
