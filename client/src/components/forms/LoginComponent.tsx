import { useAppContext } from "@/context/AppContext"
import { ChangeEvent, FormEvent, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import logo from "@/assets/logo.svg"
import axios from "axios"

const LoginComponent = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const { currentUser, setCurrentUser } = useAppContext()

    const [loading, setLoading] = useState(false)
    const usernameRef = useRef<HTMLInputElement | null>(null)

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const login = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!currentUser.roomId || !currentUser.username) {
            toast.error("Please enter email and password")
            return
        }

        setLoading(true)
        const toastId = toast.loading("Logging in...")

        try {
            const res = await axios.post("http://localhost:3000/login", {
                user_id: currentUser.roomId,
                password: currentUser.username,
            })

            toast.success("Login successful", { id: toastId })

            // Clear input
            setCurrentUser({ roomId: "", username: "" })

            onLoginSuccess()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Login failed", { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex w-full max-w-[500px] flex-col items-center justify-center gap-4 p-4 sm:w-[500px] sm:p-8">
            <img src={logo} alt="Logo" className="w-full" />
            <form onSubmit={login} className="flex w-full flex-col gap-4">
                <input
                    type="email"
                    name="roomId"
                    placeholder="Email"
                    className="w-full rounded-md border border-gray-500 bg-darkHover px-3 py-3 focus:outline-none"
                    onChange={handleInputChanges}
                    value={currentUser.roomId}
                />
                <input
                    type="password"
                    name="username"
                    placeholder="Password"
                    className="w-full rounded-md border border-gray-500 bg-darkHover px-3 py-3 focus:outline-none"
                    onChange={handleInputChanges}
                    value={currentUser.username}
                    ref={usernameRef}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`mt-2 w-full rounded-md bg-primary px-8 py-3 text-lg font-semibold text-black ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    )
}

export default LoginComponent
