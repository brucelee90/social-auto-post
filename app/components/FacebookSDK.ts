import { useEffect } from "react";

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any; // Falls du auch auf das FB-Objekt zugreifen musst
    }
}

const FacebookSDK: React.FC = () => {
    useEffect(() => {
        const loadFbSdk = () => {
            window.fbAsyncInit = function () {
                window.FB.init({
                    appId: '7494338054013588', // Replace with your actual app ID
                    cookie: true,
                    xfbml: true,
                    version: 'v19.0' // Replace with your actual API version
                });

                window.FB.AppEvents.logPageView();
            };

            (function (d, s, id) {
                let js: HTMLScriptElement;
                const fjs = d.getElementsByTagName(s)[0] as HTMLScriptElement;
                if (d.getElementById(id)) { return; }
                js = d.createElement(s) as HTMLScriptElement;
                js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode?.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        };

        // Check if the SDK script is already included
        if (!document.getElementById('facebook-jssdk')) {
            loadFbSdk();
        }
    }, []);

    return null;
};

export const checkLoginStatus = (callback: (response: any) => void) => {
    window.FB.getLoginStatus(function (response: any) {
        callback(response);
    });
};

export const handleFBLogin = (callback: (response: any) => void) => {
    window.FB.login(function (response: any) {

        callback(response);
    }, { scope: 'public_profile,email,instagram_content_publish' });
};

export default FacebookSDK;