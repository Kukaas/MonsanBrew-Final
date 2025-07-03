import React from "react";

export default function PageLayout({ title, description, children, action }) {
    return (
        <section className="flex flex-col w-full h-full min-h-0 min-w-0 flex-1 p-0">
            <header className="px-4 pb-2 lg:px-0 flex items-center gap-4">
                <h1 className="text-2xl font-bold mb-1 text-white flex-1">{title}</h1>
                {action && <div>{action}</div>}
            </header>
            {description && <p className="text-muted-foreground mb-4 text-base px-4 lg:px-0">{description}</p>}
            <div className="flex-1 min-h-0 min-w-0 flex flex-col">
                {children}
            </div>
        </section>
    );
}
