import { Loader } from 'lucide-react';
import React from 'react';

const TrackOrderLoading = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader className="animate-spin h-8 w-8 text-gray-500" />
        </div>
    );
};

export default TrackOrderLoading;