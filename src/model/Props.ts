import React from "react";

export default interface HomePageProps extends AuthProps, AlertsProps {

}

export interface AuthProps {
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface AlertsProps {
    setAlerts: React.Dispatch<React.SetStateAction<{id:number, type: "success" | "error"; message: string }[]>>;
}

