import React from "react";

export default function PageLayout({ title, description, children }) {
    return (
        <section className="flex flex-col w-full h-full min-h-0 min-w-0 flex-1 p-0">
            <header className="px-4 pb-2 lg:px-0">
                <h1 className="text-2xl font-bold mb-1 text-white">{title}</h1>
                {description && <p className="text-muted-foreground mb-4 text-base">{description}</p>}
            </header>
            <div className="flex-1 min-h-0 min-w-0 flex flex-col">
                {children}
            </div>
        </section>
    );
}
