
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
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function TextEditor() {
  const [content, setContent] = useState<string>("");
  const [paraphrasedContent, setParaphrasedContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    start: number;
    end: number;
    x: number;
    y: number;
  } | null>(null);
  // Add state for selected text paraphrasing
  const [selectedTextPair, setSelectedTextPair] = useState<{
    original: string;
    paraphrased: string;
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
      
      // Instead of replacing, store the selected text and its paraphrased version
      setSelectedTextPair({
        original: selectionInfo.text,
        paraphrased: paraphrasedText
      });
      
      setSelectionInfo(null);
      toast.success("Text successfully paraphrased!");
    } catch (error) {
      console.error("Paraphrase error:", error);
      toast.error("Failed to paraphrase selected text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFullParaphrase = async () => {
    if (content.trim() === "") {
      toast.error("Please enter some text to paraphrase");
      return;
    }
    
    try {
      setIsProcessing(true);
      const result = await paraphraseText(content);
      setParaphrasedContent(result);
      // Clear any selected text paraphrase when doing a full paraphrase
      setSelectedTextPair(null);
      toast.success("Text successfully paraphrased!");
    } catch (error) {
      console.error("Paraphrase error:", error);
      toast.error("Failed to paraphrase text. Please try again.");
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Text Editor */}
        <div className="relative w-full">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Original Text</h3>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="min-h-[300px] p-6 glass-card outline-none transition-all focus:ring-1 focus:ring-primary/50 shadow-lg animate-fade-in"
            suppressContentEditableWarning={true}
          />
          
          {content.length === 0 && (
            <div className="absolute top-12 left-6 text-gray-400 pointer-events-none">
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

        {/* Paraphrased Text Display */}
        <div className="w-full">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Paraphrased Result</h3>
          <Card className="min-h-[300px] p-6 glass-card shadow-lg animate-fade-in overflow-auto">
            {/* Display the paraphrased version of selected text if available */}
            {selectedTextPair ? (
              <div className="space-y-4">
                <div className="p-2 bg-white/5 rounded border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Selected Original</p>
                  <p className="text-foreground">{selectedTextPair.original}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded border border-primary/20">
                  <p className="text-xs text-primary mb-1">Selected Paraphrased</p>
                  <p className="text-foreground">{selectedTextPair.paraphrased}</p>
                </div>
              </div>
            ) : paraphrasedContent ? (
              <p className="text-foreground">{paraphrasedContent}</p>
            ) : (
              <p className="text-gray-400">Paraphrased content will appear here</p>
            )}
          </Card>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleFullParaphrase} 
          className="px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="h-5 w-5 mr-2 rounded-full border-2 border-r-transparent animate-spin" />
              Paraphrasing...
            </>
          ) : (
            <>
              Paraphrase Text
              <ArrowRight className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
