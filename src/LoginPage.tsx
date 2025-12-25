import PeopleRelationService from "./service/PeopleRelationService.ts";
import { type ChangeEvent, useState } from "react";
import { AuthState } from "./model/Constants.ts";
import type HomePageProps from "./model/Props.ts";
import { LockKeyhole, Mail } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

function LoginPage({ setAuthenticated }: HomePageProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const peopleRelationService: PeopleRelationService = new PeopleRelationService();

    function handleTokenChange(value: string) {
        AuthState.token = value;
    }

    function handleAuthenticate() {
        peopleRelationService.verifyOTP({ email, otp })
            .then(data => {
                handleTokenChange(data.token)
                setAuthenticated(true)
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

    function handleGenerateOTP() {
        if (!email) {
            toast.error("Please enter an email address");
            return;
        }
        peopleRelationService.generateOTP(email)
            .then(() => {
                toast.success("OTP generated and sent to your email");
            })
            .catch(err => {
                console.log(err);
                toast.error("Failed to generate OTP");
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
                            type="email"
                            placeholder="📧 Enter email..."
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setEmail(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg pr-12 pl-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="🔐 Enter OTP..."
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setOtp(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg pr-12 pl-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        />
                        <LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={handleGenerateOTP}
                        className="text-orange-600 font-semibold hover:text-orange-700 transition flex items-center gap-2"
                    >
                        <Mail className="h-5 w-5" />
                        Generate OTP
                    </button>
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