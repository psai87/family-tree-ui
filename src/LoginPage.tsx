import PeopleRelationService from "./service/PeopleRelationService.ts";
import {type ChangeEvent} from "react";
import {AuthState} from "./model/Constants.ts";
import type HomePageProps from "./model/Props.ts";
import {LockKeyhole} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {toast} from "sonner";

function LoginPage({setAuthenticated}: HomePageProps) {
    const navigate = useNavigate();
    const peopleRelationService: PeopleRelationService = new PeopleRelationService();

    function handleTokenChange(value: string) {
        AuthState.token = value;
    }

    function handleAuthenticate() {
        peopleRelationService.authenticate()
            .then(data => {
                setAuthenticated(data.authenticated)
                navigate("/view-family")
                console.log("Authentication Successful")
                toast.success("Authentication Successful")
            })
            .catch(err => {
                console.log(err)
                setAuthenticated(false)
                navigate("/")
            });
    }

    return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-white to-blue-100 p-6">
            <div className="bg-white shadow-xl rounded-2xl p-10 max-w-xl w-full text-center animate-fade-in">
                <h1 className="text-4xl font-extrabold text-orange-700 whitespace-nowrap text-ellipsis">
                    👋 Welcome to Family Tree!
                </h1>

                <p className="text-gray-600 text-lg">
                    Explore your family lineage. This feature is in <span
                    className="font-semibold text-orange-500">beta</span>.
                </p>

                <div className="space-y-4 py-3">
                    <div className="relative">
                        <input
                            type="password" // Changed to password type for security
                            placeholder="🔐 Enter password..."
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleTokenChange(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg pr-12 pl-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        />
                        <LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleAuthenticate}
                        className="bg-orange-600 text-white px-5 py-2 rounded-lg shadow hover:bg-orange-700 transition flex items-center gap-2"
                    >
                        <LockKeyhole className="h-5 w-5" />
                        Authenticate
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LoginPage