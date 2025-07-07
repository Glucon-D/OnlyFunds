/**
 * Optimized Dropdown Component
 *
 * A reusable dropdown component with enhanced hover behavior, keyboard navigation,
 * and accessibility features. Prevents premature closing when moving between
 * trigger and dropdown content.
 */

"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  placement?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  offset?: number;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  className,
  contentClassName,
  disabled = false,
  placement = "bottom-left",
  offset = 8,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, closeDropdown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, closeDropdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPlacementClasses = () => {
    switch (placement) {
      case "bottom-right":
        return "top-full right-0";
      case "top-left":
        return "bottom-full left-0";
      case "top-right":
        return "bottom-full right-0";
      default:
        return "top-full left-0";
    }
  };

  return (
    <div
      className={cn("relative", className)}
    >
      <div ref={triggerRef} onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Content */}
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 transition-all duration-300 transform origin-top overflow-hidden",
          getPlacementClasses(),
          {
            "opacity-100 scale-100 translate-y-0 pointer-events-auto": isOpen,
            "opacity-0 scale-95 -translate-y-2 pointer-events-none": !isOpen,
          },
          contentClassName
        )}
        style={{
          marginTop: placement.startsWith("bottom") ? `${offset}px` : undefined,
          marginBottom: placement.startsWith("top") ? `${offset}px` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  description?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  icon,
  description,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50",
        {
          "cursor-pointer": !disabled,
          "opacity-50 cursor-not-allowed": disabled,
        },
        className
      )}
      style={{ color: "var(--foreground)" }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "var(--card-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {icon && (
        <div className="mr-3 transition-transform duration-200">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="font-medium" style={{ color: "var(--foreground)" }}>
          {children}
        </div>
        {description && (
          <div className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            {description}
          </div>
        )}
      </div>
    </button>
  );
};

export const DropdownSeparator: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn("h-px my-2", className)}
      style={{ backgroundColor: "var(--border)" }}
    />
  );
};
