import PeopleRelationService from "./service/PeopleRelationService.ts";
import {type ChangeEvent} from "react";
import {AuthState} from "./model/Constants.ts";
import type HomePageProps from "./model/Props.ts";

function HomePage({setAuthenticated, setAlerts}: HomePageProps) {
    const peopleRelationService: PeopleRelationService = new PeopleRelationService();

    function handleTokenChange(value: string) {
        AuthState.token = value;
    }

    function handleAuthenticate() {
        peopleRelationService.authenticate()
            .then(data => {
                setAuthenticated(data.authenticated)
                console.log("Authentication Successful")
                setAlerts(prevState => [...prevState, {
                    id: Date.now(),
                    type: "success",
                    message: "Authentication Successful"
                }])
            })
            .catch(err => {
                console.log(err)
                setAuthenticated(false)
                console.log("Authentication Failed")
                setAlerts(prevState => [...prevState, {
                    id: Date.now(),
                    type: "error",
                    message: "Authentication Failed"
                }])
            });
    }

    return (
        <>
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-white to-blue-100 p-6">
                <div className="bg-white shadow-xl rounded-2xl p-10 max-w-xl w-full text-center animate-fade-in">
                    <h1 className="text-4xl font-extrabold text-blue-700 whitespace-nowrap text-ellipsis">
                        👋 Welcome to Family Tree!
                    </h1>

                    <p className="text-gray-600 text-lg">
                        Explore your family lineage. This feature is in <span
                        className="font-semibold text-blue-500">beta</span>.
                    </p>

                    <div className="space-y-4 py-3">
                        <input
                            type="text"
                            placeholder="🔐 Enter password..."
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleTokenChange(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleAuthenticate} // Replace with your actual function
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Authenticate
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePage