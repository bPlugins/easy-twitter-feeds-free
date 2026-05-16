import { Outlet, Link, useLocation } from 'react-router-dom';

import Header from '../../../../bpl-tools/Admin/Header';

const navigation = [
    { name: 'Welcome', href: '/welcome' },
    { name: 'Demos', href: '/demos' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Feature Comparison', href: '/feature-comparison' },
];

const Layout = (props) => {

    const location = useLocation();

    return <div className='bPlDashboard'>
        <Header {...props}>
            <nav className='bPlDashboardNav'>
                {navigation
                    // Hide activation link for non-pro users
                    ?.map((item, index) => <Link
                        key={index}
                        to={item.href}
                        className={`navLink ${location.pathname === item.href ? 'active' : ''}`}
                    >
                        {item.name}
                    </Link>)}
            </nav>
        </Header>

        <main className='bPlDashboardMain'>
            <Outlet />
        </main>
    </div>
}
export default Layout;