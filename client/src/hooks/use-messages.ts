import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertMessage } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMessages() {
  return useQuery({
    queryKey: [api.messages.list.path],
    queryFn: async () => {
      const res = await fetch(api.messages.list.path);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    // Sort client-side by newest first
    select: (data) => [...data].sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ),
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMessage) => {
      // Validate before sending
      const validated = api.messages.create.input.parse(data);
      
      const res = await fetch(api.messages.create.path, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.messages.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create message");
      }
      
      return api.messages.create.responses[201].parse(await res.json());
    },
    onMutate: async (newMessage) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [api.messages.list.path] });
      const previousMessages = queryClient.getQueryData([api.messages.list.path]);

      queryClient.setQueryData([api.messages.list.path], (old: any[] = []) => [
        {
          id: -1, // Temporary ID
          ...newMessage,
          createdAt: new Date().toISOString(),
        },
        ...old,
      ]);

      return { previousMessages };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData([api.messages.list.path], context?.previousMessages);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your thought has been shared.",
      });
    },
  });
}
