import React from 'react';
import {useAuthState} from "react-firebase-hooks/auth";
import {useRouter} from "next/router";
import {auth} from "@/firebase/fireBaseConfig";

export function authenticated(Component) {
    return function Auth(props) {
        const [user, loading, error] = useAuthState(auth);
        const router = useRouter();

        if (loading) {
            return <p>Loading...</p>;
        }

        if (error) {
            return <p>Error: {error.message}</p>;
        }

        if (!user) {
            router.push("/signin").then(() => null)
            return null;
        } else {
            return <Component {...props} />;
        }
    }
}
