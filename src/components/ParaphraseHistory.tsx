
import { useState, useEffect } from "react";
import { getParaphrasingHistory, HistoryItem } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ParaphraseHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getParaphrasingHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard!");
  };

  return (
    <Card className="glass-card border-white/5 shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-gradient">Paraphrase History</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
      </CardHeader>
      <CardContent className={`space-y-4 transition-all ${isExpanded ? "" : "max-h-[300px] overflow-y-auto scrollbar-none"}`}>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-r-transparent animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No paraphrasing history yet</p>
        ) : (
          history.map((item) => (
            <div key={item._id} className="space-y-2 transition-all hover:bg-white/5 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.created_at), "MMM dd, yyyy • HH:mm")}
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2 text-xs"
                    onClick={() => copyToClipboard(item.paraphrased_text)}
                  >
                    Copy Result
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="p-2 bg-white/5 rounded border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Original</p>
                  <p>{item.original_text}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded border border-primary/20">
                  <p className="text-xs text-primary mb-1">Paraphrased</p>
                  <p>{item.paraphrased_text}</p>
                </div>
              </div>
              <Separator className="bg-white/10" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
