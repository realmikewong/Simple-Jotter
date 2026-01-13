import { useState } from "react";
import { useMessages, useCreateMessage } from "@/hooks/use-messages";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const [content, setContent] = useState("");
  const { data: messages, isLoading } = useMessages();
  const createMessage = useCreateMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createMessage.mutate(
      { content },
      {
        onSuccess: () => setContent(""),
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-2xl space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-display">
            Minimal Thoughts
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            A clean space to share what's on your mind.
          </p>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            No distractions, just one line at a time.
          </p>
        </div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <form 
            onSubmit={handleSubmit}
            className="relative bg-white p-2 rounded-2xl shadow-xl shadow-black/[0.03] border border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type something meaningful..."
              disabled={createMessage.isPending}
              maxLength={280}
              className="flex-1 px-6 py-4 bg-transparent border-none text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={!content.trim() || createMessage.isPending}
              className="
                p-4 rounded-xl font-medium transition-all duration-300
                bg-primary text-primary-foreground
                hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none
              "
            >
              {createMessage.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </motion.div>

        {/* Messages List */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Thoughts</span>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : messages?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-200">
                <p>No thoughts yet. Be the first to share.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages?.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
                  >
                    <p className="text-lg text-foreground font-medium leading-relaxed">
                      {msg.content}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground/60 bg-gray-50 px-2 py-1 rounded-md">
                        {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'Just now'}
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/10 group-hover:bg-primary/40 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
