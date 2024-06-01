import React from 'react';
// import { Link } from '@shopify/polaris';
import styles from './AccountNotConnected.module.css';
import { useNavigate } from '@remix-run/react';
import { Link, Outlet, useLoaderData, useRouteError } from '@remix-run/react';
import { UnstyledLink } from '@shopify/polaris';

interface Props {}

function AccountNotConnected(props: Props) {
    const {} = props;

    const navigate = () => {
        window.location.href =
            'https://admin.shopify.com/store/l4-dev-shop/apps/social-auto-post/app/dashboard';
    };

    return (
        <div className={`${styles.account_not_connected_wrapper}`}>
            <p>Please go to the dashboard and connect your facebook account first</p>
        </div>
    );
}

export default AccountNotConnected;
