import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "../ui/alert-dialog";

export default function CustomAlertDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  actions,
  className,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent
        className={`bg-[#232323] border-none max-h-[80vh] flex flex-col ${
          className || ""
        }`}
      >
        {(title || description) && (
          <AlertDialogHeader className="flex-shrink-0">
            {title && (
              <AlertDialogTitle className="text-white text-2xl font-extrabold">
                {title}
              </AlertDialogTitle>
            )}
            {description && (
              <AlertDialogDescription className="text-[#BDBDBD] text-base font-semibold">
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
          {children}
        </div>
        {actions && (
          <AlertDialogFooter className="flex-shrink-0 py-4">
            {actions}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
