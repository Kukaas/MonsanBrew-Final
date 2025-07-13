import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const DashCard = ({ 
    title, 
    value, 
    icon: Icon, 
    gradientFrom, 
    gradientTo, 
    borderColor, 
    iconBgColor, 
    iconColor,
    className = ""
}) => {
    return (
        <Card className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} border ${borderColor} ${className}`}>
            <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                        <p className="text-gray-400 text-xs font-medium sm:text-sm">{title}</p>
                        <p className="text-white text-xl font-bold sm:text-2xl">{value}</p>
                    </div>
                    <div className={`${iconBgColor} p-2 rounded-lg mt-2 sm:mt-0`}>
                        <Icon className={`w-6 h-6 sm:w-5 sm:h-5 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DashCard; 