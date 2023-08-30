import React from 'react';
import {useSignInWithGoogle, useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/firebase/fireBaseConfig";
import {useRouter} from "next/router";

function SignIn(props) {
    const router = useRouter()
    const loggedIn = useAuthState(auth)

    async function signIn() {
        await signInWithGoogle();
        await router.push('/')

    }
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

    if (error) {
        return (
            <div>
                <p>Error: {error.message}</p>
            </div>
        );
    }
    if (loggedIn[1]) {
        return <p>Loading...</p>;
    }

    if (loggedIn[0]) {
        router.push('/').then(() => null)
        return null;
    }

    return (
        <div className="SinIn">
            <label id="signInLabel">Sign In To Palace</label>
            <button onClick={signIn}>
                <img src="https://icon-library.com/images/google-login-icon/google-login-icon-24.jpg" alt={"loginIcon"}/>
                <label>Sign In With Google</label>
            </button>
        </div>
    );
}

export default SignIn;
