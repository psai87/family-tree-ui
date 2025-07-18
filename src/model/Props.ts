import React from "react";

export default interface HomePageProps extends AuthProps, ToolTipProps {

}

export interface AuthProps {
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ToolTipProps {
    setTooltip: React.Dispatch<React.SetStateAction<null | { type: "success" | "error"; text: string }>>;
}

