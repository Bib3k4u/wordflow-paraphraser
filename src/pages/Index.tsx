
import { useState } from "react";
import TextEditor from "@/components/TextEditor";
import ParaphraseHistory from "@/components/ParaphraseHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("editor");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="py-6 px-6 md:px-10 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient">ParaPhrase</h1>
          <Badge variant="outline" className="ml-2 bg-white/5">AI</Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-5xl py-6 px-4 md:py-10">
        <Tabs defaultValue="editor" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-6">
            <TabsList className="bg-white/5 backdrop-blur-sm">
              <TabsTrigger value="editor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Editor
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                History
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="space-y-6">
            <TabsContent value="editor" className="mt-0 space-y-8">
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Smart Paraphraser</h2>
                    <p className="text-muted-foreground text-sm">
                      Select text in the editor and click the AI button to paraphrase it
                    </p>
                  </div>
                </div>
                <TextEditor />
              </section>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <section className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">Your Paraphrasing History</h2>
                  <p className="text-muted-foreground text-sm">
                    View and reuse your previous paraphrased content
                  </p>
                </div>
                <ParaphraseHistory />
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-white/10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} ParaPhrase AI | Powered by Advanced Language Models</p>
      </footer>
    </div>
  );
};

export default Index;
