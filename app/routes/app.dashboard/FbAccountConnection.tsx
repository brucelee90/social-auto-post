import { Link, AccountConnection, Text } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';

interface Props {
    isConnected: boolean;
    accName: string;
    handleLogin: () => void;
    connectionDetails: { followers_count: string; follows_count: string; media_count: string };
}

export function FbAccountConnection(props: Props) {
    const { isConnected, accName, handleLogin, connectionDetails } = props;
    const [connected, setConnected] = useState(false);
    const accountName = connected ? accName : '';

    useEffect(() => {
        setConnected(isConnected);
    }, [isConnected]);

    const handleAction = useCallback(() => {
        // setConnected((connected) => !connected);
        handleLogin();
    }, []);

    const buttonText = connected ? 'Reconfigure Connection' : 'Connect';
    const details = connected ? (
        <Text as="span" variant="bodyMd" tone="subdued">
            <div>
                successfully connected with: <strong>{accName}</strong>{' '}
            </div>
            <br />
            <div>Follower: {connectionDetails?.followers_count}</div>
            <div>Follows: {connectionDetails?.follows_count}</div>
            <div>Media uploaded: {connectionDetails?.media_count}</div>
        </Text>
    ) : (
        'No account connected'
    );

    const terms = connected ? null : (
        <p>
            By clicking <strong>Connect</strong>, you agree to accept Autobuzz’{' '}
            <Link url="Example App">terms and conditions</Link>. You’ll pay a commission rate of 15%
            on sales made through Sample App.
        </p>
    );

    return (
        <AccountConnection
            accountName={accountName}
            connected={connected}
            title="Instagram"
            action={{
                content: buttonText,
                onAction: handleAction
            }}
            details={details}
            termsOfService={terms}
        />
    );
}
