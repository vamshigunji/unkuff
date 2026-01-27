import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

describe("DashboardLayout", () => {
    it("renders the children correctly", () => {
        render(
            <DashboardLayout>
                <div data-testid="child">Content</div>
            </DashboardLayout>
        );
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("applies the liquid glass styling to the main container", () => {
        const { container } = render(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );
        // This will fail initially because the component doesn't exist
        const mainArea = container.querySelector("main > div");
        expect(mainArea).toHaveClass("bg-glass-lg");
    });

    it("renders a sidebar", () => {
        render(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );
        // This will fail initially because the sidebar doesn't exist
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
});
