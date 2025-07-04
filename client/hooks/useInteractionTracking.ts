import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface InteractionEvent {
  type: "click" | "hover" | "scroll" | "selection" | "focus";
  x: number;
  y: number;
  element: string;
  timestamp: number;
  duration?: number;
  userId?: string;
  isLoggedIn: boolean;
  pageUrl: string;
  viewportWidth: number;
  viewportHeight: number;
}

interface UseInteractionTrackingOptions {
  blogId: string;
  enabled?: boolean;
  debounceMs?: number;
}

export function useInteractionTracking({
  blogId,
  enabled = true,
  debounceMs = 100,
}: UseInteractionTrackingOptions) {
  const { user, isAuthenticated } = useAuth();
  const interactionsRef = useRef<InteractionEvent[]>([]);
  const hoverTimersRef = useRef<Map<Element, number>>(new Map());
  const scrollTimeRef = useRef<number>(0);
  const lastScrollY = useRef<number>(0);

  const getElementIdentifier = useCallback((element: Element): string => {
    // Create a meaningful identifier for the element
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const className = element.className
      ? `.${element.className.split(" ").slice(0, 2).join(".")}`
      : "";
    const textContent = element.textContent?.slice(0, 20) || "";

    return `${tagName}${id}${className} ${textContent}`.trim();
  }, []);

  const getRelativePosition = useCallback(
    (clientX: number, clientY: number) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      return {
        x: (clientX / viewportWidth) * 100,
        y: ((clientY + window.scrollY) / documentHeight) * 100,
        viewportWidth,
        viewportHeight,
      };
    },
    [],
  );

  const recordInteraction = useCallback(
    (event: Omit<InteractionEvent, "userId" | "isLoggedIn" | "pageUrl">) => {
      if (!enabled) return;

      const interaction: InteractionEvent = {
        ...event,
        userId: user?.id,
        isLoggedIn: isAuthenticated,
        pageUrl: window.location.pathname,
      };

      interactionsRef.current.push(interaction);

      // Send to analytics API (in a real app)
      // This would be debounced and batched
      if (typeof window !== "undefined") {
        console.log("📊 Interaction recorded:", interaction);

        // Store in localStorage for demo purposes
        const existingData =
          localStorage.getItem(`interactions_${blogId}`) || "[]";
        const interactions = JSON.parse(existingData);
        interactions.push(interaction);

        // Keep only last 1000 interactions to prevent storage overflow
        if (interactions.length > 1000) {
          interactions.splice(0, interactions.length - 1000);
        }

        localStorage.setItem(
          `interactions_${blogId}`,
          JSON.stringify(interactions),
        );
      }
    },
    [enabled, user?.id, isAuthenticated, blogId],
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target) return;

      const position = getRelativePosition(event.clientX, event.clientY);

      recordInteraction({
        type: "click",
        x: position.x,
        y: position.y,
        element: getElementIdentifier(target),
        timestamp: Date.now(),
        viewportWidth: position.viewportWidth,
        viewportHeight: position.viewportHeight,
      });
    },
    [getRelativePosition, recordInteraction, getElementIdentifier],
  );

  const handleMouseEnter = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target) return;

    const startTime = Date.now();
    hoverTimersRef.current.set(target, startTime);
  }, []);

  const handleMouseLeave = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target) return;

      const startTime = hoverTimersRef.current.get(target);
      if (!startTime) return;

      const duration = Date.now() - startTime;
      hoverTimersRef.current.delete(target);

      // Only record hovers longer than 500ms
      if (duration > 500) {
        const rect = target.getBoundingClientRect();
        const position = getRelativePosition(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );

        recordInteraction({
          type: "hover",
          x: position.x,
          y: position.y,
          element: getElementIdentifier(target),
          timestamp: startTime,
          duration,
          viewportWidth: position.viewportWidth,
          viewportHeight: position.viewportHeight,
        });
      }
    },
    [getRelativePosition, recordInteraction, getElementIdentifier],
  );

  const handleScroll = useCallback(() => {
    const currentTime = Date.now();
    const currentScrollY = window.scrollY;

    // Debounce scroll events
    if (currentTime - scrollTimeRef.current < debounceMs) return;
    scrollTimeRef.current = currentTime;

    // Only record significant scroll movements (more than 50px)
    if (Math.abs(currentScrollY - lastScrollY.current) > 50) {
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollPercentage =
        (currentScrollY / (documentHeight - viewportHeight)) * 100;

      recordInteraction({
        type: "scroll",
        x: 50, // Center of viewport
        y: scrollPercentage,
        element: `scroll-${Math.round(scrollPercentage)}%`,
        timestamp: currentTime,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });

      lastScrollY.current = currentScrollY;
    }
  }, [debounceMs, recordInteraction]);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length < 10) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) return;

    const position = getRelativePosition(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );

    recordInteraction({
      type: "selection",
      x: position.x,
      y: position.y,
      element: `selection: "${selection.toString().slice(0, 30)}..."`,
      timestamp: Date.now(),
      viewportWidth: position.viewportWidth,
      viewportHeight: position.viewportHeight,
    });
  }, [getRelativePosition, recordInteraction]);

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners
    document.addEventListener("click", handleClick);
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);
    document.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("selectionchange", handleSelection);

    // Track initial page load
    recordInteraction({
      type: "focus",
      x: 50,
      y: 0,
      element: "page-load",
      timestamp: Date.now(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [
    enabled,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleScroll,
    handleSelection,
    recordInteraction,
  ]);

  const getInteractions = useCallback(() => {
    return interactionsRef.current;
  }, []);

  const clearInteractions = useCallback(() => {
    interactionsRef.current = [];
    localStorage.removeItem(`interactions_${blogId}`);
  }, [blogId]);

  return {
    getInteractions,
    clearInteractions,
    totalInteractions: interactionsRef.current.length,
  };
}
