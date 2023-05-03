import { useSignOut } from 'react-firebase-hooks/auth';
import {auth} from "@/firebase/fireBaseConfig";

const SignOut = () => {
    const [signOut, loading, error] = useSignOut(auth);

    if (error) {
        return (
            <div>
                <p>Error: {error.message}</p>
            </div>
        );
    }
    if (loading) {
        return <p>Loading...</p>;
    }
    return (
        <div className="App">
            <button onClick={async () => await signOut()}>Sign out</button>
        </div>
    );
};

export default SignOut;
