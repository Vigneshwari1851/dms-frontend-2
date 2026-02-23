import React from "react";

const EmptyState = ({ imageSrc, message = "No data available", description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center p-2">
            <img
                src={imageSrc}
                alt="Empty state"
                className="w-full max-w-[300px] lg:max-w-[400px] h-auto mb-4 opacity-80"
            />
            <p className="text-gray-400 text-base font-medium mb-1">{message}</p>
            {description && (
                <p className="text-gray-500 text-sm text-center max-w-md">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
