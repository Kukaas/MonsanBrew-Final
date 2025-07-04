import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, AlertTriangle, Clock } from 'lucide-react';

export default function StatusBadge({ stock, status }) {
    let icon, text, textClass;
    if (status === 'in_stock') {
        icon = <CheckCircle2 className="fill-green-500 dark:fill-green-400" />;
        text = 'In  Stock';
        textClass = 'text-green-500';
    } else if (status === 'out_of_stock') {
        icon = <Loader2 className="text-red-500" />;
        text = 'Out of Stock';
        textClass = 'text-red-500';
    } else if (status === 'expired') {
        icon = <Clock className="text-red-500" />;
        text = 'Expired';
        textClass = 'text-red-500';
    } else if (status === 'low_stock') {
        icon = <AlertTriangle className="text-yellow-400" />;
        text = 'Low Stock';
        textClass = 'text-yellow-400';
    } else {
        icon = <Loader2 className="text-gray-400" />;
        text = status || 'Unknown';
        textClass = 'text-gray-400';
    }
    return (
        <Badge variant="outline" className="px-1.5">
            {icon}
            <span className={textClass}>{text}</span>
        </Badge>
    );
}
