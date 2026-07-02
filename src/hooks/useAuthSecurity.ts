import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";


// 10 minutes in milliseconds
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

export function useAuthSecurity() {
  const navigate = useNavigate();
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // ---- 1. Single Device Login Security ----
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("device_id", deviceId);
    }

    let realtimeSubscription: any = null;
    let userId: string | null = null;

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      userId = session.user.id;

      // Update current session on load if we have a user
      await supabase
        .from("profiles")
        .update({ current_session_id: deviceId })
        .eq("id", userId);

      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription);
      }

      // Subscribe to profile changes
      realtimeSubscription = supabase
        .channel(`profiles_security_${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${userId}`
          },
          async (payload) => {
            const currentSession = payload.new.current_session_id;
            // If the database session doesn't match our local device session, another device logged in
            if (currentSession && currentSession !== deviceId) {
              await supabase.auth.signOut();
              toast.error("You have been logged out because your account was accessed from another device.", {
                duration: 10000
              });
              navigate({ to: "/login" });
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        userId = session.user.id;
        // On new sign in, set this device as the active one
        await supabase
          .from("profiles")
          .update({ current_session_id: deviceId })
          .eq("id", userId);
          
        if (!realtimeSubscription) {
          setupRealtime();
        }
      } else if (event === "SIGNED_OUT") {
        if (realtimeSubscription) {
          supabase.removeChannel(realtimeSubscription);
          realtimeSubscription = null;
        }
      }
    });


    // ---- 2. Idle Timeout Security ----
    const handleIdleTimeout = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        toast.info("You have been automatically logged out due to 10 minutes of inactivity.", {
          duration: 10000
        });
        navigate({ to: "/login" });
      }
    };

    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(handleIdleTimeout, IDLE_TIMEOUT_MS);
    };

    // Attach listeners
    const activityEvents = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Initialize timer
    resetIdleTimer();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription);
      }
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
}
