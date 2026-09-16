const API_URL = import.meta.env.VITE_API_URL
import { useState } from "react"

function SignupForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    function handleSubmit(event) {
        event.preventDefault()

        if (!username || !password) {
            setMessage("Username and password are required")
            return
        }
        fetch(`${API_URL}/api/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then((response) => {
                return response.json().then((data) => {
                    if (!response.ok) {
                        throw new Error(data.error)
                    }
                    return data
                })
            })
            .then((data) => {
                setMessage(data.message)
            })
            .catch((error) => {
                setMessage(error.message)
            })
    }
    return (
        <form onSubmit={handleSubmit}>
            <label>Username</label>

            <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
            />

            <label>Password</label>
            <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />

            <button type="submit">Sign Up</button>
            {message && <p>{message}</p>}
        </form>
    )
}

export default SignupForm