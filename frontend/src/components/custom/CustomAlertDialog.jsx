import React from 'react';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from '../ui/alert-dialog';

export default function CustomAlertDialog({
    open, onOpenChange, trigger, title, description, children, actions, className
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
            <AlertDialogContent className={`bg-[#232323] border-none ${className || ''}`}>
                <AlertDialogHeader>
                    {title && <AlertDialogTitle className="text-white text-2xl font-extrabold">{title}</AlertDialogTitle>}
                    {description && <AlertDialogDescription className="text-[#BDBDBD] text-base font-semibold">{description}</AlertDialogDescription>}
                </AlertDialogHeader>
                {children}
                {actions && <AlertDialogFooter>{actions}</AlertDialogFooter>}
            </AlertDialogContent>
        </AlertDialog>
    );
}
