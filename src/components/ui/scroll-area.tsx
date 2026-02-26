import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import type { Ref } from "react";
import { cn } from "@/lib/utils";

function ScrollArea({
  className,
  children,
  classNameViewport,
  viewportRef,
  showMask = true,
  scrollbars = "both",
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  classNameViewport?: string;
  viewportRef?: Ref<HTMLDivElement>;
  showMask?: boolean;
  scrollbars?: "both" | "vertical" | "horizontal";
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative min-h-0 min-w-0", className)}
      data-slot="scroll-area"
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          "size-full min-w-0 rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50",
          showMask &&
            "data-overflow-y-start:mask-t-from-[calc(100%-2rem)] data-overflow-y-end:mask-b-from-[calc(100%-2rem)] data-overflow-x-start:mask-l-from-[calc(100%-2rem)] data-overflow-x-end:mask-r-from-[calc(100%-2rem)]",
          classNameViewport
        )}
        data-slot="scroll-area-viewport"
        ref={viewportRef}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {(scrollbars === "both" || scrollbars === "vertical") && (
        <ScrollBar orientation="vertical" />
      )}
      {(scrollbars === "both" || scrollbars === "horizontal") && (
        <ScrollBar orientation="horizontal" />
      )}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(
        "flex touch-none select-none p-px transition-colors data-horizontal:h-2.5 data-vertical:h-full data-vertical:w-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:border-l data-vertical:border-l-transparent",
        className
      )}
      data-orientation={orientation}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        className="relative flex-1 rounded-full bg-border"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea };
