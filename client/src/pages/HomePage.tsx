import { useState } from "react";
import illustration from "@/assets/illustration.png";
import FormComponent from "@/components/forms/FormComponent";
import LoginComponent from "@/components/forms/LoginComponent";
import SignupComponent from "@/components/forms/SignupComponent";
// import Footer from "@/components/common/Footer";

function HomePage() {
    const [step, setStep] = useState<"login" | "signup" | "form">("login");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-16 transition-all duration-500">
            <div className="my-12 flex h-full min-w-full flex-col items-center justify-evenly sm:flex-row sm:pt-0">
                <div className="flex w-full animate-up-down justify-center sm:w-1/2 sm:pl-4">
                    <img
                        src={illustration}
                        alt="Code Sync Illustration"
                        className="mx-auto w-[300px] sm:w-[450px]"
                    />
                </div>

                <div className="flex w-full flex-col items-center justify-center sm:w-1/2">
                    {step === "login" && (
                        <div className="w-full animate-fade-in">
                            <LoginComponent   onLoginSuccess={() => setStep("form")}/>
                            <button
                                onClick={() => setStep("signup")}
                                className="mt-4 text-blue-600  text-xl hover:underline"
                            >
                                Don't have an account? Register
                            </button>
                        </div>
                    )}

                    {step === "signup" && (
                        <div className="w-full animate-fade-in">
                            <SignupComponent onSingupSuccess={() => setStep("form")} />
                            <button
                                onClick={() => setStep("login")}
                                className="mt-4 text-xl text-blue-600 hover:underline"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}

                    {step === "form" && (
                        <div className="w-full animate-fade-in">
                            <FormComponent />
                        </div>
                    )}
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
}

export default HomePage;
