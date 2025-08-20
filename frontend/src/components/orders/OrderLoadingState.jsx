import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const OrderLoadingState = () => {
    return (
        <div className="w-full max-w-5xl">
            <Tabs value="all" className="w-full">
                {/* Sticky Tabs */}
                <div className="sticky top-16 z-10 bg-[#232323] pb-4">
                    <div className="bg-white rounded-2xl p-2 shadow">
                        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-transparent h-auto p-0 gap-1">
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                            >
                                All
                            </TabsTrigger>
                            <TabsTrigger
                                value="to_ship"
                                className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                            >
                                <span className="hidden sm:inline">To Ship</span>
                                <span className="sm:hidden">To Ship</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="to_receive"
                                className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                            >
                                <span className="hidden sm:inline">To Receive</span>
                                <span className="sm:hidden">To Receive</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                            >
                                <span className="hidden sm:inline">Completed</span>
                                <span className="sm:hidden">Completed</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="cancelled"
                                className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                            >
                                <span className="hidden sm:inline">Cancelled</span>
                                <span className="sm:hidden">Cancelled</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="return_refund"
                                className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                            >
                                <span className="hidden sm:inline">Return/Refund</span>
                                <span className="sm:hidden">Refund</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <div className="space-y-4 mt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 shadow">
                            <div className="flex justify-between items-start mb-3">
                                <Skeleton className="h-4 w-32 bg-gray-200" />
                                <Skeleton className="h-4 w-20 bg-gray-200" />
                            </div>
                            <Skeleton className="h-16 w-full bg-gray-200 mb-2" />
                            <Skeleton className="h-4 w-1/3 bg-gray-200" />
                        </div>
                    ))}
                </div>
            </Tabs>
        </div>
    );
};

export default OrderLoadingState;
