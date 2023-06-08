import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {auth} from "@/firebase/fireBaseConfig";

const restricted = (Component) => {
    return (props) => {
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const router = useRouter();

        useEffect(() => {
            const fetchData = async () => {
                const player = {
                    id: auth.currentUser.uid,
                    name: auth.currentUser.displayName
                }
                const response = await fetch('/api/join', {
                    method: 'PUT',
                    body: JSON.stringify({room: props.room, player}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const status = response.status;

                setLoading(false);
                if (status !== 204) {
                    const {error} = await response.json();
                    setError(error)
                }
            };

            fetchData();
        }, []);

        if (loading) {
            return <div>Loading...</div>;
        }

        if (error) {
            router.push({
                pathname: '/join',
                query: { error: error }
            });
        }

        return <Component {...props} />;
    };
};

export default restricted;
