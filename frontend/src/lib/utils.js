import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import React from "react";
import { CheckCircle2, Clock, Settings, Truck, XCircle, Shield, Monitor, ShoppingCart, User as UserIcon, UserCheck, RotateCcw } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Order Status Utilities
export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    case 'approved':
      return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    case 'preparing':
      return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
    case 'waiting_for_rider':
      return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30';
    case 'out_for_delivery':
      return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
    case 'completed':
      return 'bg-green-500/20 text-green-500 border-green-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    case 'out_of_stock':
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    case 'low_stock':
      return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    default:
      return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'preparing':
      return 'Preparing';
    case 'waiting_for_rider':
      return 'Waiting for Rider';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'out_of_stock':
      return 'Out of Stock';
    case 'low_stock':
      return 'Low Stock';
    default:
      return status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return React.createElement(Clock, { className: "w-4 h-4 text-yellow-500" });
    case 'approved':
      return React.createElement(CheckCircle2, { className: "w-4 h-4 text-blue-500" });
    case 'preparing':
      return React.createElement(Settings, { className: "w-4 h-4 text-orange-500" });
    case 'waiting_for_rider':
      return React.createElement(UserCheck, { className: "w-4 h-4 text-indigo-500" });
    case 'out_for_delivery':
      return React.createElement(Truck, { className: "w-4 h-4 text-purple-500" });
    case 'completed':
      return React.createElement(CheckCircle2, { className: "w-4 h-4 text-green-500" });
    case 'cancelled':
      return React.createElement(XCircle, { className: "w-4 h-4 text-red-500" });
    case 'refund':
      return React.createElement(RotateCcw, { className: "w-4 h-4 text-orange-500" });
    default:
      return React.createElement(Clock, { className: "w-4 h-4 text-gray-500" });
  }
};

export const getStatusTextColor = (status) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500';
    case 'approved':
      return 'text-blue-500';
    case 'preparing':
      return 'text-orange-500';
    case 'waiting_for_rider':
      return 'text-indigo-500';
    case 'out_for_delivery':
      return 'text-purple-500';
    case 'completed':
      return 'text-green-500';
    case 'cancelled':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    case 'rider':
      return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    case 'frontdesk':
      return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
    case 'customer':
      return 'bg-green-500/20 text-green-500 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  }
};

export const getRoleIcon = (role) => {
  switch (role) {
    case 'admin':
      return React.createElement(Shield, { className: 'w-4 h-4 text-red-500' });
    case 'rider':
      return React.createElement(Truck, { className: 'w-4 h-4 text-blue-500' });
    case 'frontdesk':
      return React.createElement(Monitor, { className: 'w-4 h-4 text-purple-500' });
    case 'customer':
      return React.createElement(ShoppingCart, { className: 'w-4 h-4 text-green-500' });
    default:
      return React.createElement(UserIcon, { className: 'w-4 h-4 text-gray-500' });
  }
};
