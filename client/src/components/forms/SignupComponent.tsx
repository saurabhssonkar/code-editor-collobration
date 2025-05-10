import { useAppContext } from "@/context/AppContext";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import logo from "@/assets/logo.svg";
import axios from "axios";

const SignupComponent = ({ onSingupSuccess }: { onSingupSuccess: () => void }) => {
  const { currentUser, setCurrentUser } = useAppContext();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const isFormValid =
    currentUser.roomId &&
    currentUser.username &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  const Signup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Registering...");

      const response = await axios.post("http://localhost:3000/register", {
        firstname: currentUser.roomId,
        user_id: currentUser.username,
        password,
      });
      console.log("firstname",currentUser.roomId)

      toast.dismiss();
      toast.success("Registration successful");
      setCurrentUser({ roomId: "", username: "" });
      setPassword("");
      setConfirmPassword("");
  
      onSingupSuccess();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[500px] flex-col items-center justify-center gap-4 p-4 sm:w-[500px] sm:p-8">
      <img src={logo} alt="Logo" className="w-full" />
      <form onSubmit={Signup} className="flex w-full flex-col gap-4">
        <input
          type="text"
          name="roomId"
          placeholder="Name"
          className="w-full rounded-md border border-gray-500 bg-darkHover px-3 py-3 focus:outline-none"
          onChange={handleInputChanges}
          value={currentUser.roomId}
        />
        <input
          type="email"
          name="username"
          placeholder="Email"
          className="w-full rounded-md border border-gray-500 bg-darkHover px-3 py-3 focus:outline-none"
          onChange={handleInputChanges}
          value={currentUser.username}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full rounded-md border border-gray-500 bg-darkHover px-3 py-3 focus:outline-none"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="w-full rounded-md border border-gray-500 bg-darkHover px-3 py-3 focus:outline-none"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
        />
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`mt-2 w-full rounded-md px-8 py-3 text-lg font-semibold text-black ${
            isFormValid && !loading ? "bg-primary" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default SignupComponent;
