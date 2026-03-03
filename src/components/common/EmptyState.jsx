import React from "react";

const EmptyState = ({ imageSrc, message = "No data available", description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center p-2">
            <img
                src={imageSrc}
                alt="Empty state"
                className="w-42 h-auto mb-4"
            />
            <p className="text-gray-400 text-base font-medium mb-1">{message}</p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
