import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"
import logo from "@/assets/logo.svg"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()

    const [showDropdown, setShowDropdown] = useState(false)
    const [email, setEmail] = useState("")
    const [generatedLink, setGeneratedLink] = useState("")
    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        const newId = uuidv4()
        setCurrentUser({ ...currentUser, roomId: newId })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    const generateShareLink = async () => {
        if (!currentUser.roomId) {
            toast.error("Create or enter a room first")
            return
        }
        const link = `${window.location.origin}/editor/${currentUser.roomId}`
        setGeneratedLink(link)
        toast.success("Sharable link generated")
    }

    const generateEmailLink = async () => {
        if (!email) {
            toast.error("Enter email to validate")
            return
        }

        try {
            const res = await axios.post(`http://localhost:3000/users/validate`,{
                email:email
            })
            if (res.data.exists) {
                const link = `${window.location.origin}/editor/${currentUser.roomId}&email=${email}`
                setGeneratedLink(link)
                toast.success("Link generated for valid email")
            } else {
                toast.error("Email not found in database")
            }
        } catch (err) {
            toast.error("Something went wrong while checking the email")
        }
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }

        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: { username },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <div className="flex w-full max-w-[500px] flex-col items-center justify-center gap-4 p-4 sm:w-[500px] sm:p-8">
            <img src={logo} alt="Logo" className="w-full"/>
            <form onSubmit={joinRoom} className="flex w-full flex-col gap-4">
                <input
                    type="text"
                    name="roomId"
                    placeholder="Room Id"
                    className="w-full rounded-md border border-gray-500 bg-darkHover px-3 py-3 focus:outline-none"
                    onChange={handleInputChanges}
                    value={currentUser.roomId}
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full rounded-md border border-gray-500 bg-darkHover px-3 py-3 focus:outline-none"
                    onChange={handleInputChanges}
                    value={currentUser.username}
                    ref={usernameRef}
                />
                <button
                    type="submit"
                    className="mt-2 w-full rounded-md bg-orange-400 px-8 py-3 text-lg font-semibold text-black"
                >
                    Join
                </button>
            </form>

            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="mt-4 text-xl rounded bg-secondary px-4 py-2 text-white"
            >
                Share ▼
            </button>

            {showDropdown && (
                <div className="mt-2 w-full rounded-md border border-gray-500 bg-darkHover p-4 shadow-md">
                    <div className="mb-2">
                        <button onClick={generateShareLink} className="text-blue-400 text-lg underline">
                            Anyone with link can join
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <input
                            type="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border border-gray-400 px-2 py-2 text-black"
                        />
                        <button
                            onClick={generateEmailLink}
                            className="rounded bg-blue-500 px-3 py-1 text-lg text-white"
                        >
                            Share with Email
                        </button>
                    </div>
                </div>
            )}

            {generatedLink && (
                <div className="mt-4 text-lg w-full break-words rounded bg-gray-800 p-2  text-white">
                    Shareable Link: <a href={generatedLink} className="text-blue-400 underline">{generatedLink}</a>
                </div>
            )}

            <button
                className="cursor-pointer text-xl select-none underline"
                onClick={createNewRoomId}
            >
                Generate Unique Room Id
            </button>
        </div>
    )
}

export default FormComponent
