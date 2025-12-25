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
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-background to-accent/20 p-4 sm:p-6">
            <div className="bg-card shadow-2xl rounded-3xl p-6 sm:p-12 max-w-xl w-full text-center animate-fade-in border border-border">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-primary mb-2 tracking-tight">
                    👋 Welcome to Family Tree!
                </h1>

                <p className="text-muted-foreground text-lg sm:text-xl mb-8">
                    Explore your family lineage. This feature is in <span
                        className="font-bold text-primary italic">beta</span>.
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
                            className="w-full border border-border rounded-xl pr-12 pl-5 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-muted/20"
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="🔐 Enter OTP..."
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setOtp(e.target.value)
                            }
                            className="w-full border border-border rounded-xl pr-12 pl-5 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-muted/20"
                        />
                        <LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
                    <button
                        onClick={handleGenerateOTP}
                        className="text-primary font-bold hover:opacity-80 transition-all flex items-center gap-2 text-lg w-full sm:w-auto justify-center"
                    >
                        <Mail className="h-6 w-6" />
                        Generate OTP
                    </button>
                    <button
                        onClick={handleAuthenticate}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 text-lg w-full sm:w-auto justify-center"
                    >
                        <LockKeyhole className="h-6 w-6" />
                        Authenticate
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LoginPage