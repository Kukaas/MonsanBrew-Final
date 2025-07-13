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
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-medium">{title}</p>
                        <p className="text-white text-2xl font-bold">{value}</p>
                    </div>
                    <div className={`${iconBgColor} p-2 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DashCard; 