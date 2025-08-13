import { Spinner } from "@heroui/react";

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerColor = "secondary" | "current" | "white" | "default" | "primary" | "success" | "warning" | "danger";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

export default function LoadingSpinner({ size = "lg", color = "secondary", className = "" }: LoadingSpinnerProps) {
  return <Spinner size={size} color={color} className={className} />;
}
