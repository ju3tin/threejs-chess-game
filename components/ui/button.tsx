"use client";

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cn } from "@/lib/utils";   // or your clsx/tailwind-merge helper

interface ButtonProps extends React.ComponentProps<typeof ButtonPrimitive> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      className={cn(/* your variant styles here */ className)}
      {...props}
    />
  );
}
