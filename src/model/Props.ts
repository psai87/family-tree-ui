import React from "react";

export default interface HomePageProps extends AuthProps {

}

export interface AuthProps {
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}
